package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.example.DAO.MesasDAO;
import org.example.DAO.ProductosDAO;
import org.example.DTO.EstadoMesa;
import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ClienteHilo extends Thread {
    private Socket socket;
    private final Gson gson = new Gson();
    private OutputStream outputStream;
    //Variables para almacenar reservas activas y mesas reservadas
    private final Map<Integer, Integer> reservasActivas = new HashMap<>();
    private Integer mesaReservadaId = null;

    public ClienteHilo(String name, Socket socket) {
        super(name);
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            /*
                Desactiva el algoritmo de Nagle
                Esto evita que el servidor acumule paquetes pequeños para enviarlos juntos,
                asegurando que los mensajes se envíen inmediatamente.
            */
            socket.setTcpNoDelay(true);
        } catch (Exception e) {
            System.err.println("[" + getName() + "] No se pudo configurar TCP_NODELAY: " + e.getMessage());
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))) {
            this.outputStream = socket.getOutputStream();
            System.out.println(">>> [" + getName() + "] Cliente conectado desde " + socket.getInetAddress());

            String jsonRecibido;
            while ((jsonRecibido = reader.readLine()) != null) {
                System.out.println("[" + getName() + "] Mensaje entrante: " + jsonRecibido);
                processRequest(jsonRecibido);
            }

        } catch (IOException e) {
            System.err.println("[" + getName() + "] Error de red: " + e.getMessage());
        } finally {
            //Libera las reservas activas y elimina al cliente
            liberarReservasActivas();
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
                    if (payload != null && payload.has("id") && payload.has("estado")) {
                        String estado = payload.get("estado").getAsString();
                        //Si la mesa se reserva, se almacena su ID
                        if ("RESERVADA".equalsIgnoreCase(estado)) {
                            mesaReservadaId = payload.get("id").getAsInt();
                        } else if ("LIBRE".equalsIgnoreCase(estado)) {
                            mesaReservadaId = null;
                        }
                    }
                    break;
                case "GET_MENU":
                    respuesta = FuncionesServidor.procesarGetMenu();
                    break;
                case "GET_PEDIDOS_USUARIO":
                    respuesta = FuncionesServidor.procesarGetPedidosUsuario(payload);
                    break;
                case "RESERVAR_PRODUCTO":
                    respuesta = FuncionesServidor.procesarReservarProducto(payload);
                    if (payload != null && respuesta != null) {
                        try {
                            JsonObject respJson = gson.fromJson(respuesta, JsonObject.class);
                            JsonObject respPayload = respJson.getAsJsonObject("payload");
                            //Si la reserva es exitosa, se almacenan los productos reservados
                            if (respPayload != null && respPayload.has("success") && respPayload.get("success").getAsBoolean()) {
                                int prodId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
                                int cant = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
                                //Se almacenan los productos reservados, sumando las cantidades si ya existían
                                reservasActivas.merge(prodId, cant, Integer::sum);
                            }
                        } catch (Exception e) {
                            System.err.println("[" + getName() + "] Error al reservar el producto: " + e.getMessage());
                        }
                    }
                    break;
                case "LIBERAR_RESERVA":
                    respuesta = FuncionesServidor.procesarLiberarReserva(payload);
                    if (payload != null) {
                        int prodId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
                        int cant = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
                        //Se actualizan las cantidades de los productos reservados, restando las cantidades
                        reservasActivas.merge(prodId, -cant, Integer::sum);
                        //Se eliminan los productos reservados cuya cantidad sea menor o igual a 0
                        reservasActivas.values().removeIf(v -> v <= 0);
                    }
                    break;
                case "FINALIZAR_RESERVA":
                    respuesta = FuncionesServidor.procesarFinalizarReserva(payload);
                    if (payload != null) {
                        int prodId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
                        int cant = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
                        reservasActivas.merge(prodId, -cant, Integer::sum);
                        reservasActivas.values().removeIf(v -> v <= 0);
                    }
                    break;
                case "CREAR_PEDIDO":
                    respuesta = FuncionesServidor.procesarCrearPedido(payload);
                    if (respuesta != null) {
                        try {
                            JsonObject respJson = gson.fromJson(respuesta, JsonObject.class);
                            JsonObject respPayload = respJson.getAsJsonObject("payload");
                            //Si el pedido es exitoso, se elimina la mesa reservada
                            if (respPayload != null && respPayload.has("success") && respPayload.get("success").getAsBoolean()) {
                                mesaReservadaId = null;
                            }
                        } catch (Exception e) {
                            System.err.println("[" + getName() + "] Error al procesar el pedido: " + e.getMessage());
                        }
                    }
                    break;
                case "INSERTAR_DETALLES":
                    respuesta = FuncionesServidor.procesarInsertarDetalles(payload);
                    break;
                case "UPDATE_ESTADO_DETALLE":
                    respuesta = FuncionesServidor.procesarUpdateEstadoDetalle(payload);
                    break;
                case "CERRAR_MESA":
                    respuesta = FuncionesServidor.procesarCerrarMesa(payload);
                    break;
                default:
                    System.out.println("[" + getName() + "] Tipo desconocido: " + tipo);
                    respuesta = GeneradorJSON.generarError("Acción no reconocida en el servidor");
            }

            if (respuesta != null) {
                send(respuesta);
            }

        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al parsear JSON: " + e.getMessage());
            send(GeneradorJSON.generarError("Error interno procesando JSON"));
        }
    }

    //Metodo publico para enviar mensajes al cliente desde fuera de la Clase
    public void sendMessage(String json) {
        send(json);
    }

    //Metodo privado para enviar mensajes al cliente, sincronizado para evitar que se envien dos mensajes a la vez
    private synchronized void send(String json) {
        if (outputStream != null) {
            try {
                outputStream.write((json + "\n").getBytes(StandardCharsets.UTF_8));
                outputStream.flush();
            } catch (IOException e) {
                System.err.println("[" + getName() + "] Error al enviar mensaje: " + e.getMessage());
            }
        }
    }

    //Libera las reservas activas
    private void liberarReservasActivas() {
        boolean huboCambios = false;
        //Si hay reservas activas, liberarlas
        if (!reservasActivas.isEmpty()) {
            System.out.println("[" + getName() + "] Liberando " + reservasActivas.size() + " tipo(s) de reserva por desconexión");
            for (Map.Entry<Integer, Integer> entry : reservasActivas.entrySet()) {
                try {
                    ProductosDAO.liberarReserva(entry.getKey(), entry.getValue());
                    System.out.println("[" + getName() + "] Reserva liberada: producto " + entry.getKey() + " x" + entry.getValue());
                    huboCambios = true;
                } catch (Exception e) {
                    System.err.println("[" + getName() + "] Error liberando reserva producto " + entry.getKey() + ": " + e.getMessage());
                }
            }
            reservasActivas.clear();
        }
        //Si hay mesa reservada, liberarla
        if (mesaReservadaId != null) {
            try {
                MesasDAO.actualizarEstadoMesa(mesaReservadaId, EstadoMesa.LIBRE);
                System.out.println("[" + getName() + "] Mesa " + mesaReservadaId + " liberada por desconexión");
                Servidor.broadcast(GeneradorJSON.generarMesaUpdated(mesaReservadaId, "LIBRE"));
                mesaReservadaId = null;
            } catch (Exception e) {
                System.err.println("[" + getName() + "] Error liberando mesa " + mesaReservadaId + ": " + e.getMessage());
            }
        }
        
        if (huboCambios) {
            ArrayList<Integer> noDisponibles = ProductosDAO.obtenerNoDisponibles();
            Servidor.broadcast(GeneradorJSON.generarStockUpdated(noDisponibles));
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