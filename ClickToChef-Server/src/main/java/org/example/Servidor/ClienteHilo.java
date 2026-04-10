package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.example.DAO.UsuariosDAO;
import org.example.DAO.MesasDAO;
import org.example.DTO.EstadoMesa;
import org.example.DTO.Usuarios;
import org.example.DTO.Mesas;

import java.io.*;
import java.net.Socket;
import java.util.ArrayList;

public class ClienteHilo extends Thread {
    private Socket socket;
    private final Gson gson = new Gson();
    private PrintWriter writer;

    public ClienteHilo(String name, Socket socket) {
        super(name);
        this.socket = socket;
    }

    @Override
    public void run() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            // Importante: autoflush en true para que el móvil reciba los datos al instante
            this.writer = new PrintWriter(socket.getOutputStream(), true);

            System.out.println(">>> [" + getName() + "] Cliente conectado desde " + socket.getInetAddress());

            String jsonRecibido;
            while ((jsonRecibido = reader.readLine()) != null) {
                System.out.println("[" + getName() + "] Mensaje entrante: " + jsonRecibido);
                processRequest(jsonRecibido);
            }

        } catch (IOException e) {
            System.err.println("[" + getName() + "] Error de red: " + e.getMessage());
        } finally {
            Servidor.removeCliente(this);
            closeConnection();
        }
    }

    /**
     * Orquestador de peticiones.
     * Lee el "type" del JSON enviado por el móvil y llama al método correspondiente.
     */
    private void processRequest(String json) {
        try {
            JsonObject peticion = gson.fromJson(json, JsonObject.class);

            if (!peticion.has("type")) {
                sendError("Formato de petición inválido: falta campo 'type'");
                return;
            }

            String tipo = peticion.get("type").getAsString();

            switch (tipo) {
                case "LOGIN":
                    handleLogin(peticion.getAsJsonObject("payload"));
                    break;

                case "GET_MESAS":
                    handleGetMesas();
                    break;

                case "UPDATE_MESA_STATUS":
                    handleUpdateMesaStatus(peticion.getAsJsonObject("payload"));
                    break;

                default:
                    System.out.println("[" + getName() + "] Tipo desconocido: " + tipo);
                    sendError("Acción no reconocida en el servidor");
            }
        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al parsear JSON: " + e.getMessage());
            sendError("Error interno procesando JSON");
        }
    }

    /**
     * Actualiza el estado de una mesa y notifica a todos los clientes (broadcast)
     */
    private void handleUpdateMesaStatus(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("estado")) {
            sendError("Payload de actualización incompleto");
            return;
        }

        int id = payload.get("id").getAsInt();
        String estadoStr = payload.get("estado").getAsString();
        EstadoMesa nuevoEstado = EstadoMesa.valueOf(estadoStr.toUpperCase());

        System.out.println("[" + getName() + "] Actualizando mesa " + id + " a " + nuevoEstado);

        boolean exito = MesasDAO.actualizarEstadoMesa(id, nuevoEstado);

        if (exito) {
            // Si la base de datos se actualizó, notificamos a TODOS
            JsonObject broadcastMsg = new JsonObject();
            broadcastMsg.addProperty("type", "MESA_UPDATED");
            JsonObject resPayload = new JsonObject();
            resPayload.addProperty("id", id);
            resPayload.addProperty("estado", estadoStr.toUpperCase());
            broadcastMsg.add("payload", resPayload);

            Servidor.broadcast(gson.toJson(broadcastMsg));
        } else {
            sendError("No se pudo actualizar la mesa en la base de datos");
        }
    }

    /**
     * Utilidad para enviar mensajes individuales al cliente
     */
    public void sendMessage(String json) {
        if (writer != null) {
            writer.println(json);
        }
    }

    /**
     * Obtiene la lista de mesas y la envía al cliente
     */
    private void handleGetMesas() {
        System.out.println("[" + getName() + "] Obteniendo lista de mesas...");
        
        ArrayList<Mesas> listaMesas = MesasDAO.obtenerTodas();
        
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "MESAS_RESPONSE");
        
        JsonObject resPayload = new JsonObject();
        resPayload.add("mesas", gson.toJsonTree(listaMesas));
        
        respuesta.add("payload", resPayload);
        
        writer.println(gson.toJson(respuesta));
        System.out.println("[" + getName() + "] Lista de mesas enviada (" + listaMesas.size() + " mesas)");
    }

    /**
     * Gestiona la autenticación consultando al DAO y respondiendo al SocketClient
     */
    private void handleLogin(JsonObject payload) {
        if (payload == null) {
            sendError("Payload de login vacío");
            return;
        }

        String user = payload.has("username") ? payload.get("username").getAsString() : "";
        String pass = payload.has("pass") ? payload.get("pass").getAsString() : "";

        System.out.println("[" + getName() + "] Procesando login para: " + user);

        // Llamada a tu DAO de Base de Datos
        Usuarios usuarioValidado = UsuariosDAO.login(user, pass);

        // Creamos la respuesta con la estructura que espera tu SocketClient.ts
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("type", "LOGIN_RESPONSE");

        JsonObject resPayload = new JsonObject();
        if (usuarioValidado != null) {
            resPayload.addProperty("success", true);
            resPayload.add("user", gson.toJsonTree(usuarioValidado));
            resPayload.addProperty("pass", pass); // Se devuelve para que el móvil lo guarde en SecureStore
            System.out.println("[" + getName() + "] Login OK para " + user);
        } else {
            resPayload.addProperty("success", false);
            System.out.println("[" + getName() + "] Login fallido para " + user);
        }

        respuesta.add("payload", resPayload);

        // Enviamos el JSON al móvil (PrintWriter.println añade el \n automático)
        writer.println(gson.toJson(respuesta));
    }

    /**
     * Utilidad para enviar mensajes de error genéricos al móvil
     */
    private void sendError(String mensaje) {
        JsonObject error = new JsonObject();
        error.addProperty("type", "SERVER_ERROR");
        JsonObject payload = new JsonObject();
        payload.addProperty("message", mensaje);
        error.add("payload", payload);

        if (writer != null) {
            writer.println(gson.toJson(error));
        }
    }

    private void closeConnection() {
        try {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
            System.out.println("<<< [" + getName() + "] Conexión finalizada.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}