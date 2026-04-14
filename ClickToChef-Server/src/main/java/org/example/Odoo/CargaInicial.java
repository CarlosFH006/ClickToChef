package org.example.Odoo;

import org.apache.xmlrpc.XmlRpcException;
import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.example.DAO.IngredientesDAO;
import org.example.DAO.ProductosDAO;
import org.example.DTO.Ingredientes;
import org.example.DTO.Productos;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class CargaInicial {
    private static final String CONFIG_PATH = "config.properties";


    // Sincroniza ingredientes y platos desde MySQL hacia Odoo.

    // Almacena los platos y los ingredientes en productos de Odoo pero los separa en consu (ingredientes) y service(platos)
    public static void cargaInicialDatos() {
        try {
            Properties properties = cargarConfiguracion();
            String url = leerPropiedadObligatoria(properties, "odoo.url");
            String db = leerPropiedadObligatoria(properties, "odoo.db");
            String user = leerPropiedadObligatoria(properties, "odoo.user");
            String apiKey = leerPropiedadObligatoria(properties, "odoo.password");

            XmlRpcClient commonClient = crearCliente(url + "/xmlrpc/2/common");
            XmlRpcClient objectClient = crearCliente(url + "/xmlrpc/2/object");

            int uid = autenticar(commonClient, db, user, apiKey);
            if (uid <= 0) {
                throw new RuntimeException("No se pudo autenticar en Odoo.");
            }

            if (odooYaContieneDatos(objectClient, db, uid, apiKey)) {
                System.out.println("Sincronizacion omitida: Odoo ya contiene datos");
                return;
            }

            cargarIngredientes(objectClient, db, uid, apiKey);
            cargarPlatos(objectClient, db, uid, apiKey);
        } catch (RuntimeException e) {
            throw e;
        }
    }

    private static Properties cargarConfiguracion() {
        try {
            Properties properties = new Properties();
            try (FileInputStream fis = new FileInputStream(CONFIG_PATH)) {
                properties.load(fis);
            }
            return properties;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer el archivo config.properties.", e);
        }
    }

    private static String leerPropiedadObligatoria(Properties properties, String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isBlank()) {
            //Detener la conexión porque falta una propiedad necesaria para que funcione Odoo
            throw new IllegalArgumentException("Falta la propiedad obligatoria: " + key);
        }
        return value;
    }

    private static XmlRpcClient crearCliente(String endpoint) {
        try {
            XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
            config.setServerURL(new URL(endpoint));

            XmlRpcClient client = new XmlRpcClient();
            client.setConfig(config);
            return client;
        } catch (Exception e) {
            throw new RuntimeException("La URL de Odoo no es valida.", e);
        }
    }

    private static int autenticar(XmlRpcClient commonClient, String db, String user, String apiKey) {
        try {
            Object result = commonClient.execute(
                    "authenticate",
                    Arrays.asList(db, user, apiKey, new HashMap<String, Object>())
            );
            return ((Number) result).intValue();
        } catch (XmlRpcException e) {
            throw new RuntimeException("Error al autenticarse en Odoo.", e);
        }
    }

    private static boolean odooYaContieneDatos(XmlRpcClient objectClient, String db, int uid, String apiKey) {
        try {
            // Usamos search_read para detectar si Odoo ya tiene productos cargados.
            Object result = objectClient.execute(
                    "execute_kw",
                    Arrays.asList(
                            db,
                            uid,
                            apiKey,
                            "product.template",
                            "search_read",
                            Arrays.asList(Arrays.asList()),
                            Map.of("fields", Arrays.asList("id"), "limit", 1)
                    )
            );

            Object[] registros = (Object[]) result;
            return registros.length > 0;
        } catch (XmlRpcException e) {
            throw new RuntimeException("Error al consultar productos existentes en Odoo.", e);
        }
    }

    private static void cargarIngredientes(XmlRpcClient objectClient, String db, int uid, String apiKey) {
        try {
            ArrayList<Ingredientes> ingredientes = IngredientesDAO.obtenerTodos();

            for (Ingredientes ingrediente : ingredientes) {
                // En Odoo 17 los almacenables se modelan como consumibles con is_storable=true.
                Map<String, Object> valoresOdoo = new HashMap<>();
                valoresOdoo.put("name", ingrediente.getNombre());
                valoresOdoo.put("type", "consu");
                valoresOdoo.put("is_storable", true);

                if (ingrediente.getMetodoMedida() != null) {
                    valoresOdoo.put("description_purchase", "Unidad de medida: " + ingrediente.getMetodoMedida().name().toLowerCase());
                }

                Object result = objectClient.execute(
                        "execute_kw",
                        Arrays.asList(
                                db,
                                uid,
                                apiKey,
                                "product.template",
                                "create",
                                Arrays.asList(valoresOdoo),
                                new HashMap<String, Object>()
                        )
                );

                int odooProductId = ((Number) result).intValue();
                IngredientesDAO.actualizarOdooProductId(ingrediente.getId(), odooProductId);
            }
        } catch (XmlRpcException e) {
            throw new RuntimeException("Error al cargar ingredientes en Odoo.", e);
        }
    }

    private static void cargarPlatos(XmlRpcClient objectClient, String db, int uid, String apiKey) {
        try {
            ArrayList<Productos> productos = ProductosDAO.obtenerTodos();

            for (Productos producto : productos) {
                // Los platos del KDS se representan como servicios en Odoo.
                Map<String, Object> valoresOdoo = new HashMap<>();
                valoresOdoo.put("name", producto.getNombre());
                valoresOdoo.put("type", "service");
                valoresOdoo.put("list_price", producto.getPrecio());

                if (producto.getDescripcion() != null && !producto.getDescripcion().isBlank()) {
                    valoresOdoo.put("description_sale", producto.getDescripcion());
                }

                objectClient.execute(
                        "execute_kw",
                        Arrays.asList(
                                db,
                                uid,
                                apiKey,
                                "product.template",
                                "create",
                                Arrays.asList(valoresOdoo),
                                new HashMap<String, Object>()
                        )
                );
            }
        } catch (XmlRpcException e) {
            throw new RuntimeException("Error al cargar platos en Odoo.", e);
        }
    }
}
