package org.example.Servidor;

import com.google.gson.*;

import org.java_websocket.WebSocket;
import org.example.DAO.DetallesPedidoDAO;
import org.example.DAO.UsuariosDAO;
import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;
import org.example.DTO.Usuarios;
import java.util.ArrayList;

public class WebSocketHandler {

    private static final Gson gson = new Gson();

    public static void process(WebSocket conn, String json) {

        JsonObject peticion = gson.fromJson(json, JsonObject.class);

        String type = peticion.get("type").getAsString();

        switch (type) {
            case "LOGIN":
                handleLogin(conn, peticion.getAsJsonObject("payload"));
                break;
            case "GET_DETALLES_PEDIDO":
                handleGetDetallesPedido(conn);
                break;
            case "UPDATE_ESTADO_DETALLE":
                handleUpdateEstadoDetalle(conn, peticion.getAsJsonObject("payload"));
                break;
        }
    }

    private static void handleLogin(WebSocket conn, JsonObject payload) {
        if (payload == null) {
            sendError(conn, "Payload de login vacío");
            return;
        }

        String user = payload.has("username") ? payload.get("username").getAsString() : "";
        String pass = payload.has("pass") ? payload.get("pass").getAsString() : "";

        System.out.println("[WebSocket] Procesando login para: " + user);

        // Llamada a tu DAO de Base de Datos
        Usuarios usuarioValidado = UsuariosDAO.login(user, pass);

        // Enviamos la respuesta
        conn.send(GeneradorJSON.generarLoginResponse(usuarioValidado, pass));

        if (usuarioValidado != null) {
            System.out.println("[WebSocket] Login OK para " + user);
        } else {
            System.out.println("[WebSocket] Login fallido para " + user);
        }
    }

    private static void handleGetDetallesPedido(WebSocket conn) {
        ArrayList<DetallesPedido> detalles = DetallesPedidoDAO.obtenerTodos();
        conn.send(GeneradorJSON.generarDetallesPedidoResponse(detalles));
    }

    private static void handleUpdateEstadoDetalle(WebSocket conn, JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("estado")) {
            sendError(conn, "Payload de UPDATE_ESTADO_DETALLE incompleto");
            return;
        }

        int id = payload.get("id").getAsInt();
        EstadoDetallePedido nuevoEstado = EstadoDetallePedido.valueOf(payload.get("estado").getAsString());

        boolean success = DetallesPedidoDAO.updateEstado(id, nuevoEstado);
        conn.send(GeneradorJSON.generarUpdateEstadoDetalleResponse(success, id));

        if (success) {
            ArrayList<DetallesPedido> detalles = DetallesPedidoDAO.obtenerTodos();
            Servidor.broadcast(GeneradorJSON.generarDetallesPedidoResponse(detalles));
        }
    }

    private static void sendError(WebSocket conn, String mensaje) {
        if (conn != null) {
            conn.send(GeneradorJSON.generarError(mensaje));
        }
    }


}