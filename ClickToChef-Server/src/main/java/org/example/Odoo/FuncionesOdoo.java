package org.example.Odoo;

import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.example.DAO.DetallesPedidoDAO;
import org.example.DAO.IngredientesDAO;
import org.example.DAO.ProductosDAO;
import org.example.DAO.RecetasDAO;
import org.example.DTO.DetallesPedido;
import org.example.DTO.Ingredientes;
import org.example.DTO.Productos;
import org.example.DTO.Recetas;
import org.example.Servidor.ObtenerProperties;

import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Clase que centraliza toda la comunicación con Odoo vía XML-RPC.
 *
 * Odoo expone dos endpoints XML-RPC:
 *   - /xmlrpc/2/common  → autenticación (no requiere uid)
 *   - /xmlrpc/2/object  → operaciones sobre modelos (requiere uid obtenido al autenticar)
 *
 * Funcionalidades principales:
 *   - Sincronización inicial del catálogo de productos e ingredientes al arrancar el servidor
 *   - Creación de tickets de venta en el módulo TPV (pos.order) al cerrar una mesa
 *   - Descuento automático del stock de ingredientes en Odoo tras cada servicio
 *   - Actualización de precios y stock desde el panel de administración
 */
public class FuncionesOdoo {

    // Lee los parámetros de conexión desde config.properties
    private static String urlOdoo() { return ObtenerProperties.obtenerParametro("odoo.url"); }
    private static String db()      { return ObtenerProperties.obtenerParametro("odoo.db"); }
    private static String username(){ return ObtenerProperties.obtenerParametro("odoo.user"); }
    private static String password(){ return ObtenerProperties.obtenerParametro("odoo.password"); }

    /**
     * Autentica contra Odoo y devuelve el UID del usuario.
     * El UID es necesario para todas las llamadas posteriores a /xmlrpc/2/object.
     * Si las credenciales son incorrectas o Odoo no está disponible lanza RuntimeException.
     */
    private static int autenticar() {
        try {
            XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
            config.setServerURL(new URL(urlOdoo() + "/xmlrpc/2/common"));
            config.setEnabledForExtensions(true);
            XmlRpcClient client = new XmlRpcClient();
            client.setConfig(config);
            Object result = client.execute("authenticate", new Object[]{db(), username(), password(), new HashMap<>()});
            if (!(result instanceof Integer)) throw new RuntimeException("Autenticación fallida en Odoo");
            return (Integer) result;
        } catch (Exception e) {
            throw new RuntimeException("Error al autenticar en Odoo", e);
        }
    }

    /**
     * Crea y devuelve el cliente XML-RPC apuntando al endpoint de modelos (/xmlrpc/2/object).
     * Este cliente se reutiliza para todas las operaciones CRUD sobre modelos de Odoo.
     */
    private static XmlRpcClient crearClienteModelos() {
        try {
            XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
            config.setServerURL(new URL(urlOdoo() + "/xmlrpc/2/object"));
            config.setEnabledForExtensions(true);
            XmlRpcClient client = new XmlRpcClient();
            client.setConfig(config);
            return client;
        } catch (Exception e) {
            throw new RuntimeException("Error al crear el cliente de modelos Odoo", e);
        }
    }

    /**
     * Obtiene el ID de la ubicación de stock principal del almacén (lot_stock_id).
     * En Odoo, el stock se gestiona por ubicación. "lot_stock_id" es la ubicación
     * interna donde se almacena el inventario real del primer almacén configurado.
     * Este ID se usa en todas las operaciones sobre stock.quant.
     */
    private static int obtenerLocationStock(XmlRpcClient models, int uid) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"lot_stock_id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "stock.warehouse", "search_read",
                    new Object[]{new Object[]{}},
                    kwargs
            });
            if (resultado.length == 0) throw new RuntimeException("No se encontró ningún almacén en Odoo");
            // lot_stock_id es un Many2one → Odoo lo devuelve como [id, nombre]
            Object[] lotStock = (Object[]) ((Map<?, ?>) resultado[0]).get("lot_stock_id");
            return (Integer) lotStock[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener la ubicación de stock de Odoo", e);
        }
    }

    /**
     * Busca el impuesto de venta del 10% (IVA restauración España) en Odoo.
     * Devuelve su ID o 0 si no se encuentra.
     */
    private static int obtenerImpuesto10(XmlRpcClient models, int uid) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "account.tax", "search_read",
                    new Object[]{new Object[]{
                            new Object[]{"amount", "=", 10.0},
                            new Object[]{"type_tax_use", "=", "sale"},
                            new Object[]{"active", "=", true}
                    }},
                    kwargs
            });
            if (resultado.length == 0) return 0;
            return (Integer) ((Map<?, ?>) resultado[0]).get("id");
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] No se encontró el impuesto del 10%: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Busca un product.template en Odoo por nombre exacto y tipo.
     * tipo puede ser "consu" (almacenable) o "service".
     * Devuelve el ID del template si existe, o 0 si no se encuentra.
     */
    private static int buscarProductoOdooPorNombre(XmlRpcClient models, int uid, String nombre, String tipo) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] dominio = tipo != null
                    ? new Object[]{new Object[]{"name", "=", nombre}, new Object[]{"type", "=", tipo}}
                    : new Object[]{new Object[]{"name", "=", nombre}};
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "search_read",
                    new Object[]{dominio},
                    kwargs
            });
            if (resultado.length == 0) return 0;
            return (Integer) ((Map<?, ?>) resultado[0]).get("id");
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar producto en Odoo: " + nombre, e);
        }
    }

    /**
     * Comprueba si un product.template con ese ID sigue existiendo en Odoo.
     * Se usa antes de reutilizar un odoo_id guardado en la BD local,
     * por si el producto fue eliminado manualmente en Odoo.
     */
    private static boolean existeProductoEnOdoo(XmlRpcClient models, int uid, int odooId) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "search_read",
                    new Object[]{new Object[]{new Object[]{"id", "=", odooId}}},
                    kwargs
            });
            return resultado.length > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Crea un nuevo product.template en Odoo y devuelve su ID.
     *
     * tipo "consu" + is_storable=true → ingrediente almacenable (tiene stock.quant, aparece en inventario)
     * tipo "service"                  → plato del menú sin stock, con IVA 10% asignado automáticamente
     *
     * precio > 0 establece el precio de venta (list_price) con IVA incluido.
     */
    private static int crearProductoOdoo(XmlRpcClient models, int uid, String nombre, String tipo, double precio) {
        try {
            Map<String, Object> vals = new HashMap<>();
            vals.put("name", nombre);
            vals.put("type", tipo);
            if (tipo.equals("consu")) vals.put("is_storable", true);
            if (precio > 0) vals.put("list_price", precio);
            if (tipo.equals("service")) {
                int taxId = obtenerImpuesto10(models, uid);
                if (taxId > 0) vals.put("taxes_id", new Object[]{new Object[]{6, 0, new Object[]{taxId}}});
            }
            Object resultado = models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "create",
                    new Object[]{vals},
                    new HashMap<>()
            });
            return (Integer) resultado;
        } catch (Exception e) {
            throw new RuntimeException("Error al crear producto en Odoo: " + nombre, e);
        }
    }

    /**
     * Obtiene el ID de la variante (product.product) a partir del ID del template (product.template).
     *
     * En Odoo, product.template es la ficha maestra del producto y product.product es la variante
     * concreta. Para productos sin variantes hay exactamente una variante por template.
     * Los pedidos TPV y los movimientos de stock usan product.product, no product.template.
     * Lanza excepción si el producto no tiene variantes.
     */
    private static int obtenerProductoVarianteId(XmlRpcClient models, int uid, int templateId) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"product_variant_ids"});
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "read",
                    new Object[]{new Object[]{templateId}},
                    kwargs
            });
            // product_variant_ids es una lista de IDs de variantes; tomamos la primera
            Object[] variantIds = (Object[]) ((Map<?, ?>) resultado[0]).get("product_variant_ids");
            if (variantIds == null || variantIds.length == 0)
                throw new RuntimeException("El producto template ID " + templateId + " no tiene variantes en Odoo");
            return (Integer) variantIds[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener variante del producto template ID: " + templateId, e);
        }
    }

    /**
     * Actualiza (o crea) el registro de stock en Odoo para un ingrediente en una ubicación concreta.
     *
     * El stock en Odoo se gestiona a través de stock.quant: un registro por combinación
     * (product.product, ubicación). Si ya existe el quant se actualiza la cantidad,
     * si no existe se crea. Solo escribe si la diferencia supera 0.001 para evitar
     * llamadas innecesarias a la API.
     */
    private static void actualizarStockOdoo(XmlRpcClient models, int uid, int odooProductId, double stock, int locationId) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id", "quantity"});
            Object[] quants = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "stock.quant", "search_read",
                    new Object[]{new Object[]{
                            new Object[]{"product_id", "=", odooProductId},
                            new Object[]{"location_id", "=", locationId}
                    }},
                    kwargs
            });

            if (quants.length > 0) {
                Map<?, ?> quant = (Map<?, ?>) quants[0];
                double stockOdoo = ((Number) quant.get("quantity")).doubleValue();
                if (Math.abs(stockOdoo - stock) > 0.001) {
                    Map<String, Object> vals = new HashMap<>();
                    vals.put("quantity", stock);
                    models.execute("execute_kw", new Object[]{
                            db(), uid, password(), "stock.quant", "write",
                            new Object[]{new Object[]{(Integer) quant.get("id")}, vals},
                            new HashMap<>()
                    });
                }
            } else {
                Map<String, Object> vals = new HashMap<>();
                vals.put("product_id", odooProductId);
                vals.put("location_id", locationId);
                vals.put("quantity", stock);
                models.execute("execute_kw", new Object[]{
                        db(), uid, password(), "stock.quant", "create",
                        new Object[]{vals},
                        new HashMap<>()
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar stock en Odoo para producto ID: " + odooProductId, e);
        }
    }

    /**
     * Busca el partner "Cliente Final" en Odoo. Si no existe lo crea.
     * Se usa como cliente genérico en todos los tickets TPV del restaurante.
     */
    private static int obtenerPartnerClienteFinal(XmlRpcClient models, int uid) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "res.partner", "search_read",
                    new Object[]{new Object[]{new Object[]{"name", "=", "Cliente Final"}}},
                    kwargs
            });
            if (resultado.length > 0) return (Integer) ((Map<?, ?>) resultado[0]).get("id");
            Map<String, Object> vals = new HashMap<>();
            vals.put("name", "Cliente Final");
            vals.put("customer_rank", 1);
            return (Integer) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "res.partner", "create",
                    new Object[]{vals}, new HashMap<>()
            });
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener/crear partner Cliente Final", e);
        }
    }

    /**
     * Busca una sesión de TPV en estado "opened" o "opening_control".
     * Si no hay ninguna, crea y abre una nueva automáticamente usando la primera
     * configuración de TPV disponible en Odoo.
     */
    private static int obtenerSesionTPVAbierta(XmlRpcClient models, int uid) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.session", "search_read",
                    new Object[]{new Object[]{
                            new Object[]{"state", "in", new Object[]{"opened", "opening_control"}},
                            new Object[]{"rescue", "=", false}
                    }},
                    kwargs
            });
            if (resultado.length > 0) return (Integer) ((Map<?, ?>) resultado[0]).get("id");
            return abrirSesionTPV(models, uid);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener sesión TPV abierta: " + e.getMessage(), e);
        }
    }

    /**
     * Crea y abre una nueva sesión de TPV usando la primera configuración disponible en Odoo.
     * Lanza excepción si no existe ningún pos.config configurado.
     */
    private static int abrirSesionTPV(XmlRpcClient models, int uid) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] configs = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.config", "search_read",
                    new Object[]{new Object[]{}}, kwargs
            });
            if (configs.length == 0) throw new RuntimeException("No hay ninguna configuración de TPV en Odoo");
            int configId = (Integer) ((Map<?, ?>) configs[0]).get("id");
            Map<String, Object> sessionVals = new HashMap<>();
            sessionVals.put("config_id", configId);
            int sessionId = (Integer) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.session", "create",
                    new Object[]{sessionVals}, new HashMap<>()
            });
            models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.session", "action_pos_session_open",
                    new Object[]{new Object[]{sessionId}}, new HashMap<>()
            });
            System.out.println("[FuncionesOdoo] Sesión TPV abierta con ID: " + sessionId);
            return sessionId;
        } catch (Exception e) {
            throw new RuntimeException("Error al abrir sesión TPV: " + e.getMessage(), e);
        }
    }

    /**
     * Busca el método de pago de la sesión TPV que coincida con el método usado por el camarero.
     * Para EFECTIVO busca el método con is_cash_count=true, para TARJETA el que no lo sea.
     * Si no encuentra el método exacto devuelve el primero disponible como fallback.
     */
    private static int obtenerMetodoPago(XmlRpcClient models, int uid, int sessionId, String metodoPago) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"payment_method_ids"});
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.session", "read",
                    new Object[]{new Object[]{sessionId}}, kwargs
            });
            Object[] methodIds = (Object[]) ((Map<?, ?>) resultado[0]).get("payment_method_ids");
            if (methodIds.length == 0) throw new RuntimeException("No hay métodos de pago en la sesión TPV");

            // Busca el método de pago que coincida con el nombre (efectivo o tarjeta)
            boolean buscarEfectivo = "EFECTIVO".equalsIgnoreCase(metodoPago);
            Map<String, Object> nameKwargs = new HashMap<>();
            nameKwargs.put("fields", new Object[]{"id", "name", "is_cash_count"});
            Object[] methods = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.payment.method", "read",
                    new Object[]{methodIds}, nameKwargs
            });
            for (Object m : methods) {
                Map<?, ?> method = (Map<?, ?>) m;
                boolean isCash = Boolean.TRUE.equals(method.get("is_cash_count"));
                if (buscarEfectivo && isCash) return (Integer) method.get("id");
                if (!buscarEfectivo && !isCash) return (Integer) method.get("id");
            }
            // Si no encuentra el método exacto, devuelve el primero disponible
            return (Integer) methodIds[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener método de pago del TPV", e);
        }
    }

    public static void actualizarPrecioEnOdoo(int odooTemplateId, double precio) {
        if (odooTemplateId == 0) return;
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            Map<String, Object> vals = new HashMap<>();
            vals.put("list_price", precio);
            models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "write",
                    new Object[]{new Object[]{odooTemplateId}, vals},
                    new HashMap<>()
            });
            System.out.println("[FuncionesOdoo] Precio actualizado en Odoo (template " + odooTemplateId + ") → " + precio);
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al actualizar precio en Odoo: " + e.getMessage());
        }
    }

    public static int registrarProductoEnOdoo(String nombre, double precio) {
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            int templateId = buscarProductoOdooPorNombre(models, uid, nombre, "service");
            if (templateId == 0) {
                templateId = crearProductoOdoo(models, uid, nombre, "service", precio);
                System.out.println("[FuncionesOdoo] Producto '" + nombre + "' creado en Odoo con ID: " + templateId);
            }
            return templateId;
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al registrar producto en Odoo: " + e.getMessage());
            return -1;
        }
    }

    public static void sumarStockOdoo(int odooProductId, double nuevoStockActual) {
        if (odooProductId == 0) return;
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);
            int varianteId = obtenerProductoVarianteId(models, uid, odooProductId);
            actualizarStockOdoo(models, uid, varianteId, nuevoStockActual, locationId);
            System.out.println("[FuncionesOdoo] Stock actualizado en Odoo (template " + odooProductId + ") → " + nuevoStockActual);
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al actualizar stock en Odoo: " + e.getMessage());
        }
    }

    public static int registrarIngredienteEnOdoo(int ingredienteId, String nombre, double stock) {
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);
            int templateId = buscarProductoOdooPorNombre(models, uid, nombre, "consu");
            if (templateId == 0) {
                templateId = crearProductoOdoo(models, uid, nombre, "consu", 0);
                System.out.println("[FuncionesOdoo] Ingrediente '" + nombre + "' creado en Odoo con ID: " + templateId);
            }
            int varianteId = obtenerProductoVarianteId(models, uid, templateId);
            actualizarStockOdoo(models, uid, varianteId, stock, locationId);
            return templateId;
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al registrar ingrediente en Odoo: " + e.getMessage());
            return -1;
        }
    }

    public static String crearTicketVenta(int pedidoId, String metodoPago) {
        System.out.println("[FuncionesOdoo] Creando ticket TPV en Odoo para pedido " + pedidoId);
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();

            ArrayList<DetallesPedido> detalles = DetallesPedidoDAO.obtenerPorPedido(pedidoId);
            if (detalles.isEmpty()) return "SIN_DETALLES";

            ArrayList<Productos> productos = ProductosDAO.obtenerTodos();
            Map<Integer, Productos> productosMap = new HashMap<>();
            for (Productos p : productos) productosMap.put(p.getId(), p);

            int sessionId = obtenerSesionTPVAbierta(models, uid);
            int partnerId = obtenerPartnerClienteFinal(models, uid);
            int taxId = obtenerImpuesto10(models, uid);
            int paymentMethodId = obtenerMetodoPago(models, uid, sessionId, metodoPago);

            // Construye las líneas del pedido TPV
            List<Object> orderLines = new ArrayList<>();
            double totalSinIva = 0;
            double totalConIva = 0;
            for (DetallesPedido detalle : detalles) {
                Productos prod = productosMap.get(detalle.getProductoId());
                if (prod == null) continue;
                int templateId = buscarProductoOdooPorNombre(models, uid, prod.getNombre(), "service");
                if (templateId == 0) continue;
                int varianteId = obtenerProductoVarianteId(models, uid, templateId);
                double precioSinIva = Math.round(detalle.getPrecioUnitario() / 1.10 * 100.0) / 100.0;
                double lineaTotalSinIva = precioSinIva * detalle.getCantidad();
                double lineaTotalConIva = detalle.getPrecioUnitario() * detalle.getCantidad();
                totalSinIva += lineaTotalSinIva;
                totalConIva += lineaTotalConIva;
                Map<String, Object> lineVals = new HashMap<>();
                lineVals.put("product_id", varianteId);
                lineVals.put("qty", (double) detalle.getCantidad());
                lineVals.put("price_unit", precioSinIva);
                lineVals.put("price_subtotal", lineaTotalSinIva);
                lineVals.put("price_subtotal_incl", lineaTotalConIva);
                if (taxId > 0) lineVals.put("tax_ids", new Object[]{new Object[]{6, 0, new Object[]{taxId}}});
                orderLines.add(new Object[]{0, 0, lineVals});
            }
            if (orderLines.isEmpty()) return "SIN_PRODUCTOS_ODOO";

            // Crea el pos.order
            Map<String, Object> orderVals = new HashMap<>();
            orderVals.put("session_id", sessionId);
            orderVals.put("partner_id", partnerId);
            orderVals.put("lines", orderLines.toArray());
            orderVals.put("amount_total", totalConIva);
            orderVals.put("amount_tax", totalConIva - totalSinIva);
            orderVals.put("amount_paid", totalConIva);
            orderVals.put("amount_return", 0.0);
            int orderId = (Integer) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.order", "create",
                    new Object[]{orderVals}, new HashMap<>()
            });

            // Registra el pago
            Map<String, Object> paymentVals = new HashMap<>();
            paymentVals.put("pos_order_id", orderId);
            paymentVals.put("payment_method_id", paymentMethodId);
            paymentVals.put("amount", totalConIva);
            models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.payment", "create",
                    new Object[]{paymentVals}, new HashMap<>()
            });

            // Confirma el pedido como pagado
            models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.order", "action_pos_order_paid",
                    new Object[]{new Object[]{orderId}}, new HashMap<>()
            });

            // Lee la referencia generada por Odoo
            Map<String, Object> nameKwargs = new HashMap<>();
            nameKwargs.put("fields", new Object[]{"pos_reference", "name"});
            Object[] orderData = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "pos.order", "read",
                    new Object[]{new Object[]{orderId}}, nameKwargs
            });
            String reference = (String) ((Map<?, ?>) orderData[0]).get("pos_reference");
            if (reference == null || reference.isEmpty())
                reference = (String) ((Map<?, ?>) orderData[0]).get("name");

            System.out.println("[FuncionesOdoo] Ticket TPV creado: " + reference + " para pedido " + pedidoId);
            return reference;
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al crear ticket TPV: " + e.getMessage());
            if (e.getCause() != null) System.err.println("[FuncionesOdoo] Causa: " + e.getCause().getMessage());
            return "ERROR_ODOO";
        }
    }

    /**
     * Descuenta el stock de ingredientes en Odoo tras cerrar una mesa.
     * Calcula el consumo total de cada ingrediente cruzando los detalles del pedido con las
     * recetas de cada plato, y sincroniza el stock_actual (ya decrementado en la BD local
     * por finalizarReserva) con Odoo para cada ingrediente afectado.
     */
    public static void descontarStockOdoo(int pedidoId) {
        System.out.println("[FuncionesOdoo] Descontando stock en Odoo para pedido " + pedidoId);
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);

            ArrayList<DetallesPedido> detalles = DetallesPedidoDAO.obtenerPorPedido(pedidoId);
            ArrayList<Recetas> todasRecetas = RecetasDAO.obtenerTodas();
            ArrayList<Ingredientes> ingredientes = IngredientesDAO.obtenerTodos();

            Map<Integer, Ingredientes> ingredientesMap = new HashMap<>();
            for (Ingredientes ing : ingredientes) ingredientesMap.put(ing.getId(), ing);

            // Acumula el consumo total por ingrediente recorriendo detalles × recetas
            Map<Integer, Double> consumo = new HashMap<>();
            for (DetallesPedido detalle : detalles) {
                for (Recetas receta : todasRecetas) {
                    if (receta.getProductoId() == detalle.getProductoId()) {
                        double cantidad = receta.getCantidadNecesaria() * detalle.getCantidad();
                        consumo.merge(receta.getIngredienteId(), cantidad, Double::sum);
                    }
                }
            }

            // Sincroniza el stock de cada ingrediente afectado con su valor actual en la BD
            for (Map.Entry<Integer, Double> entry : consumo.entrySet()) {
                Ingredientes ing = ingredientesMap.get(entry.getKey());
                if (ing == null || ing.getOdooProductId() == 0) continue;
                int varianteId = obtenerProductoVarianteId(models, uid, ing.getOdooProductId());
                actualizarStockOdoo(models, uid, varianteId, ing.getStockActual(), locationId);
                System.out.println("[FuncionesOdoo] Stock actualizado: " + ing.getNombre() + " -> " + ing.getStockActual());
            }
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al descontar stock: " + e.getMessage());
        }
    }

    /**
     * Sincronización inicial del catálogo completo con Odoo al arrancar el servidor.
     * Ingredientes: si no tienen odoo_product_id o fue eliminado en Odoo, los busca por nombre
     * o los crea, y actualiza su stock actual.
     * Platos del menú: los sincroniza como productos de tipo "service" con su precio de venta.
     */
    public static void sincronizarOdoo() {
        System.out.println("[FuncionesOdoo] Iniciando sincronización con Odoo...");
        try {
            int uid = autenticar();
            System.out.println("[FuncionesOdoo] Autenticado en Odoo con UID: " + uid);

            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);

            // Sincronizar ingredientes (productos almacenables con stock)
            ArrayList<Ingredientes> ingredientes = IngredientesDAO.obtenerTodos();
            System.out.println("[FuncionesOdoo] Sincronizando " + ingredientes.size() + " ingredientes...");
            for (Ingredientes ing : ingredientes) {
                int templateId = ing.getOdooProductId();
                if (templateId == 0 || !existeProductoEnOdoo(models, uid, templateId)) {
                    templateId = buscarProductoOdooPorNombre(models, uid, ing.getNombre(), "consu");
                    if (templateId == 0) {
                        templateId = crearProductoOdoo(models, uid, ing.getNombre(), "consu", 0);
                        System.out.println("[FuncionesOdoo] Ingrediente '" + ing.getNombre() + "' creado en Odoo con ID: " + templateId);
                    } else {
                        System.out.println("[FuncionesOdoo] Ingrediente '" + ing.getNombre() + "' encontrado en Odoo con ID: " + templateId);
                    }
                    IngredientesDAO.actualizarOdooProductId(ing.getId(), templateId);
                }
                int varianteId = obtenerProductoVarianteId(models, uid, templateId);
                actualizarStockOdoo(models, uid, varianteId, ing.getStockActual(), locationId);
            }

            // Sincronizar productos del menú (servicios sin stock)
            ArrayList<Productos> productos = ProductosDAO.obtenerTodos();
            System.out.println("[FuncionesOdoo] Sincronizando " + productos.size() + " productos...");
            for (Productos prod : productos) {
                int odooId = prod.getOdooId();
                if (odooId == 0 || !existeProductoEnOdoo(models, uid, odooId)) {
                    odooId = buscarProductoOdooPorNombre(models, uid, prod.getNombre(), "service");
                    if (odooId == 0) {
                        odooId = crearProductoOdoo(models, uid, prod.getNombre(), "service", prod.getPrecio());
                        System.out.println("[FuncionesOdoo] Producto '" + prod.getNombre() + "' creado en Odoo con ID: " + odooId);
                    } else {
                        System.out.println("[FuncionesOdoo] Producto '" + prod.getNombre() + "' encontrado en Odoo con ID: " + odooId);
                    }
                    ProductosDAO.actualizarOdooId(prod.getId(), odooId);
                }
            }

            System.out.println("[FuncionesOdoo] Sincronización completada.");
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error durante la sincronización: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

