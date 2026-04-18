package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.*;
import java.net.Socket;

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

    private void processRequest(String json) {
        try {
            JsonObject peticion = gson.fromJson(json, JsonObject.class);

            if (!peticion.has("type")) {
                send(GeneradorJSON.generarError("Formato de petición inválido: falta campo 'type'"));
                return;
            }

            String tipo = peticion.get("type").getAsString();
            JsonObject payload = peticion.has("payload") && peticion.get("payload").isJsonObject()
                    ? peticion.getAsJsonObject("payload") : null;
            String respuesta;

            switch (tipo) {
                case "LOGIN":
                    respuesta = FuncionesServidor.procesarLogin(payload);
                    break;
                case "GET_MESAS":
                    respuesta = FuncionesServidor.procesarGetMesas();
                    break;
                case "UPDATE_MESA_STATUS":
                    respuesta = FuncionesServidor.procesarUpdateMesaStatus(payload);
                    break;
                case "GET_MENU":
                    respuesta = FuncionesServidor.procesarGetMenu();
                    break;
                case "GET_PEDIDOS_USUARIO":
                    respuesta = FuncionesServidor.procesarGetPedidosUsuario(payload);
                    break;
                case "RESERVAR_PRODUCTO":
                    respuesta = FuncionesServidor.procesarReservarProducto(payload);
                    break;
                case "LIBERAR_RESERVA":
                    respuesta = FuncionesServidor.procesarLiberarReserva(payload);
                    break;
                case "FINALIZAR_RESERVA":
                    respuesta = FuncionesServidor.procesarFinalizarReserva(payload);
                    break;
                case "CREAR_PEDIDO":
                    respuesta = FuncionesServidor.procesarCrearPedido(payload);
                    break;
                case "UPDATE_ESTADO_DETALLE":
                    respuesta = FuncionesServidor.procesarUpdateEstadoDetalle(payload);
                    break;
                default:
                    System.out.println("[" + getName() + "] Tipo desconocido: " + tipo);
                    respuesta = GeneradorJSON.generarError("Acción no reconocida en el servidor");
            }

            if (respuesta != null) send(respuesta);

        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al parsear JSON: " + e.getMessage());
            send(GeneradorJSON.generarError("Error interno procesando JSON"));
        }
    }

    public void sendMessage(String json) {
        send(json);
    }

    private void send(String json) {
        if (writer != null) writer.println(json);
    }

    private void closeConnection() {
        try {
            if (socket != null && !socket.isClosed()) socket.close();
            System.out.println("<<< [" + getName() + "] Conexión finalizada.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
