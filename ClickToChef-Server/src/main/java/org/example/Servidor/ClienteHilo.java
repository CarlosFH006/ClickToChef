package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.example.DAO.CategoriasDAO;
import org.example.DAO.MesasDAO;
import org.example.DAO.ProductosDAO;
import org.example.DTO.CategoriaPlato;
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
    private final Map<Integer, Integer> reservasActivas = new HashMap<>();
    private Integer mesaReservadaId = null;

    public ClienteHilo(String name, Socket socket) {
        super(name);
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
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
                            if (respPayload != null && respPayload.has("success") && respPayload.get("success").getAsBoolean()) {
                                int prodId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
                                int cant = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
                                reservasActivas.merge(prodId, cant, Integer::sum);
                            }
                        } catch (Exception ignored) {}
                    }
                    break;
                case "LIBERAR_RESERVA":
                    respuesta = FuncionesServidor.procesarLiberarReserva(payload);
                    if (payload != null) {
                        int prodId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
                        int cant = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
                        reservasActivas.merge(prodId, -cant, Integer::sum);
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
                            if (respPayload != null && respPayload.has("success") && respPayload.get("success").getAsBoolean()) {
                                mesaReservadaId = null;
                            }
                        } catch (Exception ignored) {}
                    }
                    break;
                case "UPDATE_ESTADO_DETALLE":
                    respuesta = FuncionesServidor.procesarUpdateEstadoDetalle(payload);
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

    public void sendMessage(String json) {
        send(json);
    }

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

    private void liberarReservasActivas() {
        boolean huboCambios = false;

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
            ArrayList<CategoriaPlato> catalogo = CategoriasDAO.categoriasplatos();
            Servidor.broadcast(GeneradorJSON.generarMenuUpdated(catalogo));
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