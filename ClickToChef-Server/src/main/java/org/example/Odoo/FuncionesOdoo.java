package org.example.Odoo;

import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.example.DAO.IngredientesDAO;
import org.example.DAO.ProductosDAO;
import org.example.DTO.Ingredientes;
import org.example.DTO.Productos;
import org.example.Servidor.ObtenerProperties;

import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class FuncionesOdoo {

    private static String urlOdoo() { return ObtenerProperties.obtenerParametro("odoo.url"); }
    private static String db()      { return ObtenerProperties.obtenerParametro("odoo.db"); }
    private static String username(){ return ObtenerProperties.obtenerParametro("odoo.user"); }
    private static String password(){ return ObtenerProperties.obtenerParametro("odoo.password"); }

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
            Object[] lotStock = (Object[]) ((Map<?, ?>) resultado[0]).get("lot_stock_id");
            return (Integer) lotStock[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener la ubicación de stock de Odoo", e);
        }
    }

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

    // Crea en product.template y devuelve su ID de template.
    // Para ingredientes usa is_storable=true para habilitar stock.quant.
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

    // Obtiene el product.product ID (variante) a partir del product.template ID.
    private static int obtenerProductoVarianteId(XmlRpcClient models, int uid, int templateId) {
        try {
            Map<String, Object> kwargs = new HashMap<>();
            kwargs.put("fields", new Object[]{"product_variant_ids"});
            Object[] resultado = (Object[]) models.execute("execute_kw", new Object[]{
                    db(), uid, password(), "product.template", "read",
                    new Object[]{new Object[]{templateId}},
                    kwargs
            });
            Object[] variantIds = (Object[]) ((Map<?, ?>) resultado[0]).get("product_variant_ids");
            return (Integer) variantIds[0];
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener variante del producto template ID: " + templateId, e);
        }
    }

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

    public static void sincronizarOdoo() {
        System.out.println("[FuncionesOdoo] Iniciando sincronización con Odoo...");
        try {
            int uid = autenticar();
            System.out.println("[FuncionesOdoo] Autenticado en Odoo con UID: " + uid);

            XmlRpcClient models = crearClienteModelos();
            int locationId = obtenerLocationStock(models, uid);

            // Sincronizar Ingredientes
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
                double stockDisponible = Math.max(0, ing.getStockActual() - ing.getStockReservado());
                actualizarStockOdoo(models, uid, varianteId, stockDisponible, locationId);
            }

            // Sincronizar Productos del menú (tipo servicio, sin stock)
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