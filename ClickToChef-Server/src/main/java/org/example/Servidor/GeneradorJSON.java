package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;
import org.example.DTO.Ingredientes;
import org.example.DTO.Mesas;
import org.example.DTO.CategoriaPlato;
import org.example.DTO.Pedidos;
import org.example.DTO.Tickets;
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

    //Genera actualización de pedidos
    public static String generarPedidosUpdated(Pedidos pedido) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "PEDIDOS_UPDATED");
        respuesta.add("payload", gson.toJsonTree(pedido));

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

    public static String generarDetalleUpdated(int id, EstadoDetallePedido estado) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "DETALLE_UPDATED");
        JsonObject payload = new JsonObject();
        payload.addProperty("id", id);
        payload.addProperty("estado", estado.name());
        respuesta.add("payload", payload);
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

    //Broadcast ligero con solo los IDs de productos no disponibles
    public static String generarStockUpdated(ArrayList<Integer> noDisponibles) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "STOCK_UPDATED");
        respuesta.add("payload", gson.toJsonTree(noDisponibles));
        return gson.toJson(respuesta);
    }

    //Broadcast cuando se crea un nuevo ticket al cerrar una mesa
    public static String generarTicketCreado(int pedidoId, double totalImporte, String metodoPago) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "TICKET_CREADO");
        JsonObject payload = new JsonObject();
        payload.addProperty("pedidoId", pedidoId);
        payload.addProperty("totalImporte", totalImporte);
        payload.addProperty("metodoPago", metodoPago);
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta con los pedidos abiertos y sus detalles para el admin
    public static String generarPedidosAdminResponse(ArrayList<Pedidos> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "PEDIDOS_ADMIN_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(lista));
        return gson.toJson(respuesta);
    }

    //Genera la respuesta con todos los usuarios sin contraseña
    public static String generarUsuariosResponse(ArrayList<Usuarios> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "USUARIOS_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(lista));
        return gson.toJson(respuesta);
    }

    //Genera la respuesta con todos los ingredientes
    public static String generarIngredientesResponse(ArrayList<Ingredientes> lista) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "INGREDIENTES_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(lista));
        return gson.toJson(respuesta);
    }

    //Genera la respuesta con todos los tickets
    public static String generarTicketsResponse(ArrayList<Tickets> tickets) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "TICKETS_RESPONSE");
        respuesta.add("payload", gson.toJsonTree(tickets));
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de cancelar pedido
    public static String generarCancelarPedidoResponse(boolean success, int pedidoId) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "CANCELAR_PEDIDO_RESPONSE");

        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("pedidoId", pedidoId);

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de cerrar mesa
    public static String generarCerrarMesaResponse(boolean success, int pedidoId, double totalImporte) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "CERRAR_MESA_RESPONSE");

        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("pedidoId", pedidoId);
        payload.addProperty("totalImporte", totalImporte);

        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Broadcast cuando se elimina un detalle
    public static String generarDetalleDeleted(int id) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "DETALLE_DELETED");
        JsonObject payload = new JsonObject();
        payload.addProperty("id", id);
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de actualizar el estado de una mesa
    public static String generarUpdateMesaStatusResponse(boolean success, int id) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "UPDATE_MESA_STATUS_RESPONSE");
        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("id", id);
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de eliminar detalle
    public static String generarEliminarDetalleResponse(boolean success, int id) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "ELIMINAR_DETALLE_RESPONSE");
        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        payload.addProperty("id", id);
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de cambiar contraseña
    public static String generarCambiarPasswordResponse(boolean success) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "CAMBIAR_PASSWORD_RESPONSE");
        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
        respuesta.add("payload", payload);
        return gson.toJson(respuesta);
    }

    //Genera la respuesta de crear usuario
    public static String generarCrearUsuarioResponse(boolean success) {
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "CREAR_USUARIO_RESPONSE");
        JsonObject payload = new JsonObject();
        payload.addProperty("success", success);
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
