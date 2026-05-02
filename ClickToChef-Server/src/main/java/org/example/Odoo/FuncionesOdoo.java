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
 * El patrón general de una llamada es:
 *   models.execute("execute_kw", { db, uid, password, modelo, método, args, kwargs })
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
     * Busca un product.template en Odoo por nombre exacto.
     * Devuelve el ID del template si existe, o 0 si no se encuentra.
     * Se usa para evitar duplicados antes de crear un producto nuevo.
     */
    private static int buscarProductoOdooPorNombre(XmlRpcClient models, int uid, String nombre) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"id"});
            kwargs.put("limit", 1);
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "search_read",
                    new Object[]{new Object[]{new Object[]{"name", "=", nombre}}},
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
     * tipo "consu" + is_storable=true → producto almacenable (tiene stock.quant, aparece en inventario)
     * tipo "service"                  → servicio sin stock (usado para los platos del menú)
     *
     * precio > 0 establece el precio de venta (list_price).
     */
    private static int crearProductoOdoo(XmlRpcClient models, int uid, String nombre, String tipo, double precio) {
        try {
            Map<String, Object> vals = new HashMap<>();
            vals.put("name", nombre);
            vals.put("type", tipo);
            if (tipo.equals("consu")) vals.put("is_storable", true);
            if (precio > 0) vals.put("list_price", precio);
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
     * En Odoo, product.template es la ficha maestra del producto.
     * product.product es la variante concreta (talla, color, etc.).
     * Para productos sin variantes hay exactamente una variante por template.
     * Las facturas y los movimientos de stock usan product.product, no product.template.
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
            return (Integer) variantIds[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener variante del producto template ID: " + templateId, e);
        }
    }

    /**
     * Actualiza (o crea) el registro de stock en Odoo para un producto en una ubicación concreta.
     *
     * En Odoo el stock físico se gestiona a través de stock.quant: un registro por
     * combinación (product.product, ubicación). Si ya existe el quant solo se escribe
     * la nueva cantidad; si no existe se crea uno nuevo.
     * Solo actualiza si la diferencia con el valor actual supera 0.001 (evita escrituras innecesarias).
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
     * Se reutiliza en todas las facturas como cliente genérico de mostrador.
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
            if (resultado.length > 0) {
                return (Integer) ((Map<?, ?>) resultado[0]).get("id");
            }
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
     * Crea una factura de venta (account.move tipo out_invoice) en Odoo con los productos del pedido.
     *
     * Flujo:
     *  1. Obtiene los detalles del pedido desde la BD local.
     *  2. Para cada producto busca su variante en Odoo por nombre.
     *  3. Construye las líneas de factura con cantidad y precio.
     *  4. Crea el account.move y lo confirma con action_post().
     *  5. Devuelve el número de factura (ej: INV/2026/00001) para guardarlo en el ticket.
     *
     * Los comandos ORM [(0, 0, vals)] le indican a Odoo que cree registros nuevos
     * enlazados al one2many invoice_line_ids.
     *
     * Si Odoo no está disponible o falla devuelve "ERROR_ODOO" sin lanzar excepción,
     * para no bloquear el cierre de mesa.
     */
    /**
     * Registra un ingrediente en Odoo (busca por nombre o lo crea) y devuelve el template ID.
     * Actualiza el stock en Odoo con el valor proporcionado.
     * Devuelve -1 si Odoo no está disponible o falla.
     */
    public static int registrarIngredienteEnOdoo(int ingredienteId, String nombre, double stock) {
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);
            int templateId = buscarProductoOdooPorNombre(models, uid, nombre);
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

    public static String crearTicketVenta(int pedidoId) {
        System.out.println("[FuncionesOdoo] Creando ticket de venta en Odoo para pedido " + pedidoId);
        try {
            int uid = autenticar();
            XmlRpcClient models = crearClienteModelos();

            ArrayList<DetallesPedido> detalles = DetallesPedidoDAO.obtenerPorPedido(pedidoId);
            if (detalles.isEmpty()) return "SIN_DETALLES";

            ArrayList<Productos> productos = ProductosDAO.obtenerTodos();
            Map<Integer, Productos> productosMap = new HashMap<>();
            for (Productos p : productos) productosMap.put(p.getId(), p);

            int partnerId = obtenerPartnerClienteFinal(models, uid);

            // Construye las líneas de factura para cada detalle del pedido
            List<Object> invoiceLines = new ArrayList<>();
            for (DetallesPedido detalle : detalles) {
                Productos prod = productosMap.get(detalle.getProductoId());
                if (prod == null) continue;
                int templateId = buscarProductoOdooPorNombre(models, uid, prod.getNombre());
                if (templateId == 0) continue;
                int varianteId = obtenerProductoVarianteId(models, uid, templateId);
                Map<String, Object> lineVals = new HashMap<>();
                lineVals.put("product_id", varianteId);
                lineVals.put("quantity", (double) detalle.getCantidad());
                lineVals.put("price_unit", prod.getPrecio());
                lineVals.put("name", prod.getNombre());
                // Comando ORM (0, 0, vals) → crear nueva línea enlazada al invoice
                invoiceLines.add(new Object[]{0, 0, lineVals});
            }
            if (invoiceLines.isEmpty()) return "SIN_PRODUCTOS_ODOO";

            // Crea el account.move (factura borrador)
            Map<String, Object> invoiceVals = new HashMap<>();
            invoiceVals.put("move_type", "out_invoice");
            invoiceVals.put("partner_id", partnerId);
            invoiceVals.put("invoice_line_ids", invoiceLines.toArray());

            int invoiceId = (Integer) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "account.move", "create",
                    new Object[]{invoiceVals}, new HashMap<>()
            });

            // Confirma la factura (pasa de borrador a publicada)
            models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "account.move", "action_post",
                    new Object[]{new Object[]{invoiceId}}, new HashMap<>()
            });

            // Lee el número de factura generado por Odoo
            Map<String, Object> nameKwargs = new HashMap<>();
            nameKwargs.put("fields", new Object[]{"name"});
            Object[] invoiceData = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "account.move", "read",
                    new Object[]{new Object[]{invoiceId}}, nameKwargs
            });
            String reference = (String) ((Map<?, ?>) invoiceData[0]).get("name");

            System.out.println("[FuncionesOdoo] Factura creada: " + reference + " para pedido " + pedidoId);
            return reference;
        } catch (Exception e) {
            System.err.println("[FuncionesOdoo] Error al crear ticket de venta: " + e.getMessage());
            return "ERROR_ODOO";
        }
    }

    /**
     * Actualiza el stock de ingredientes en Odoo después de cerrar una mesa.
     *
     * Flujo:
     *  1. Obtiene los detalles del pedido y todas las recetas.
     *  2. Calcula el consumo total de cada ingrediente:
     *       consumo[ingrediente] += cantidad_necesaria_por_unidad × cantidad_pedida
     *  3. Para cada ingrediente consumido, envía su stock_actual actualizado a Odoo.
     *
     * Se llama DESPUÉS de que finalizarReserva ya ha decrementado stock_actual en la BD local,
     * por lo que ing.getStockActual() ya refleja el valor correcto post-venta.
     * No se resta stock_reservado porque ese campo ya fue ajustado por finalizarReserva.
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
     * Sincronización inicial del catálogo completo con Odoo.
     * Se ejecuta al arrancar el servidor para asegurar que Odoo tiene todos los productos.
     *
     * Para ingredientes:
     *   - Si no tiene odoo_product_id o el ID no existe en Odoo → busca por nombre o lo crea.
     *   - Actualiza el stock disponible (stock_actual - stock_reservado).
     *
     * Para productos del menú:
     *   - Los crea como "service" (sin stock) con su precio de venta.
     *   - Solo sincroniza el catálogo, no el stock (los platos no tienen inventario propio).
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
                    templateId = buscarProductoOdooPorNombre(models, uid, ing.getNombre());
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
                    odooId = buscarProductoOdooPorNombre(models, uid, prod.getNombre());
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
