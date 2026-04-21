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

            //Lee todos los mensajes que recibe del cliente
            String jsonRecibido;
            while ((jsonRecibido = reader.readLine()) != null) {
                System.out.println("[" + getName() + "] Mensaje entrante: " + jsonRecibido);
                //Procesa el mensaje recibido
                processRequest(jsonRecibido);
            }

        } catch (IOException e) {
            System.err.println("[" + getName() + "] Error de red: " + e.getMessage());
        } finally {
            //Al terminar elimina el Hilo del Arraylist del cliente y cierra la conexión
            Servidor.removeCliente(this);
            closeConnection();
        }
    }

    private void processRequest(String json) {
        try {
            JsonObject peticion = gson.fromJson(json, JsonObject.class);

            //Comprueba que la peticion tiene Type
            if (!peticion.has("type")) {
                send(GeneradorJSON.generarError("Formato de petición inválido: falta campo 'type'"));
                return;
            }

            String tipo = peticion.get("type").getAsString();

            //Comprueba el contenido de la peticion, si tiene y es Json lo guarda y si no lo pone en Null
            JsonObject payload = peticion.has("payload") && peticion.get("payload").isJsonObject()
                    ? peticion.getAsJsonObject("payload") : null;
            String respuesta;

            //Procesa el tipo de respuesta
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

            //Si se ha generado una respuesta la envia al cliente
            if (respuesta != null) {
                send(respuesta);
            }

        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al parsear JSON: " + e.getMessage());
            send(GeneradorJSON.generarError("Error interno procesando JSON"));
        }
    }

    //Metodo publico para poder enviar mensajes desde fuera de la clase
    public void sendMessage(String json) {
        send(json);
    }

    //Envia mensaje si el PrintWriter existe
    private void send(String json) {
        if (writer != null) {
            writer.println(json);
        }
    }

    private void closeConnection() {
        try {
            if (socket != null && !socket.isClosed()){
                socket.close();
            }
            System.out.println("<<< [" + getName() + "] Conexión finalizada.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
