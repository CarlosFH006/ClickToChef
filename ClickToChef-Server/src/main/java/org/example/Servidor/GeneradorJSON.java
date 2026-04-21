package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.example.DTO.DetallesPedido;
import org.example.DTO.Mesas;
import org.example.DTO.CategoriaPlato;
import org.example.DTO.Pedidos;
import org.example.DTO.Usuarios;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

//Clase con métodos estaticos para generar los Json de las respuestas
public class GeneradorJSON {
    private static final Gson gson = new Gson();

    //Respuesta de la reserva del producto
    public static String generarReservaResponse(String type, int productoId, int cantidad, boolean success) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", type);

        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("productoId", productoId);
        payload.addProperty("cantidad", cantidad);

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Respuesta de actualización de mesa
    public static String generarMesaUpdated(int id, String estado) {
        JsonObject broadcastMsg = new JsonObject();
        broadcastMsg.addProperty("type", "MESA_UPDATED");
        
        JsonObject payload = new JsonObject();
        payload.addProperty("id", id);
        payload.addProperty("estado", estado);
        
        broadcastMsg.add("payload", payload);
        return gson.toJson(broadcastMsg);
    }

    //Respuesta de actualización de catalogo
    public static String generarMenuUpdated(ArrayList<CategoriaPlato> lista) {
        Map<Integer, JsonObject> categoriasMap = new LinkedHashMap<>();

        for (CategoriaPlato cp : lista) {
            if (!categoriasMap.containsKey(cp.getCategoriaId())) {
                JsonObject catJson = new JsonObject();
                catJson.addProperty("id", cp.getCategoriaId());
                catJson.addProperty("nombre", cp.getCategoriaNombre());
                catJson.add("productos", new JsonArray());
                categoriasMap.put(cp.getCategoriaId(), catJson);
            }

            JsonObject prodJson = new JsonObject();
            prodJson.addProperty("id", cp.getProductoId());
            prodJson.addProperty("nombre", cp.getProductoNombre());
            prodJson.addProperty("precio", cp.getPrecio());
            prodJson.addProperty("disponible", cp.isDisponible());

            categoriasMap.get(cp.getCategoriaId()).getAsJsonArray("productos").add(prodJson);
        }

        JsonArray payload = new JsonArray();
        for (JsonObject cat : categoriasMap.values()) {
            payload.add(cat);
        }

        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "MENU_UPDATED");
        respuesta.add("payload", payload);

        return gson.toJson(respuesta);
    }

    //Genera actualización de pedidos
    public static String generarPedidosUpdated(ArrayList<Pedidos> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "PEDIDOS_UPDATED");
        respuesta.add("payload", gson.toJsonTree(lista));

        return gson.toJson(respuesta);
    }

    //Genera la respuesta de mesas
    public static String generarMesasResponse(ArrayList<Mesas> listaMesas) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "MESAS_RESPONSE");

        JsonObject payload = new JsonObject();
        payload.add("mesas", gson.toJsonTree(listaMesas));

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta del menú
    public static String generarMenuResponse(ArrayList<CategoriaPlato> lista) {
        //LinkedHashMap para mantener el orden de la insercción
        Map<Integer, JsonObject> categoriasMap = new LinkedHashMap<>();

        for (CategoriaPlato cp : lista) {
            if (!categoriasMap.containsKey(cp.getCategoriaId())) {
                JsonObject catJson = new JsonObject();
                catJson.addProperty("id", cp.getCategoriaId());
                catJson.addProperty("nombre", cp.getCategoriaNombre());
                catJson.add("productos", new JsonArray());
                categoriasMap.put(cp.getCategoriaId(), catJson);
            }

            JsonObject prodJson = new JsonObject();
            prodJson.addProperty("id", cp.getProductoId());
            prodJson.addProperty("nombre", cp.getProductoNombre());
            prodJson.addProperty("precio", cp.getPrecio());
            prodJson.addProperty("disponible", cp.isDisponible());

            categoriasMap.get(cp.getCategoriaId()).getAsJsonArray("productos").add(prodJson);
        }

        JsonArray payload = new JsonArray();
        for (JsonObject cat : categoriasMap.values()) {
            payload.add(cat);
        }

        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "MENU_RESPONSE");
        respuesta.add("payload", payload);

        return gson.toJson(respuesta);
    }

    //Genera la respuesta de crear pedido
    public static String generarCrearPedidoResponse(boolean success, int pedidoId) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "CREAR_PEDIDO_RESPONSE");
        
        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("pedidoId", pedidoId);
        
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de Pedidos por usuario
    public static String generarPedidosUsuarioResponse(ArrayList<Pedidos> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "PEDIDOS_USUARIO_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(lista));

        return gson.toJson(respuesta);
    }

    //Respuesta de login
    public static String generarLoginResponse(Usuarios usuarioValidado, String pass) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "LOGIN_RESPONSE");

        JsonObject payload = new JsonObject();
        if (usuarioValidado != null) {
            payload.addProperty("success", true);
            payload.add("user", gson.toJsonTree(usuarioValidado));
            payload.addProperty("pass", pass);
        } else {
            payload.addProperty("success", false);
        }

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de los platos
    public static String generarDetallesPedidoResponse(ArrayList<DetallesPedido> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "DETALLES_PEDIDO_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(lista));
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de actualizar el estado del plato
    public static String generarUpdateEstadoDetalleResponse(boolean success, int id) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "UPDATE_ESTADO_DETALLE_RESPONSE");

        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("id", id);

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera el error del servidor
    public static String generarError(String mensaje) {
        JsonObject error = new JsonObject();
        error.addProperty("type", "SERVER_ERROR");
        
        JsonObject payload = new JsonObject();
        payload.addProperty("message", mensaje);
        
        error.add("payload", payload);
        return gson.toJson(error);
    }
}
