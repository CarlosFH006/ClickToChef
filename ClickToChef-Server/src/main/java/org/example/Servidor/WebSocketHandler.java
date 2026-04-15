package org.example.Servidor;

import com.google.gson.*;

import org.java_websocket.WebSocket;
import org.example.DAO.UsuariosDAO;
import org.example.DTO.Usuarios;

public class WebSocketHandler {

    private static final Gson gson = new Gson();

    public static void process(WebSocket conn, String json) {

        JsonObject peticion = gson.fromJson(json, JsonObject.class);

        String type = peticion.get("type").getAsString();

        switch (type) {
            case "LOGIN":
                handleLogin(conn, peticion.getAsJsonObject("payload"));
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

    private static void sendError(WebSocket conn, String mensaje) {
        if (conn != null) {
            conn.send(GeneradorJSON.generarError(mensaje));
        }
    }


}