package org.example.Servidor;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.example.DAO.ProductosDAO;
import org.example.DAO.UsuariosDAO;
import org.example.DAO.MesasDAO;
import org.example.DAO.CategoriasDAO;
import org.example.DAO.PedidosDAO;
import org.example.DAO.DetallesPedidoDAO;
import org.example.DTO.*;
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

    private void handleReservarProducto(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            sendError("Payload de RESERVAR_PRODUCTO incompleto");
            return;
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        System.out.println("[" + getName() + "] Reservando producto " + productoId + "...");

        boolean success = ProductosDAO.reservarProducto(productoId);
        sendReservaResponse("RESERVAR_PRODUCTO_RESPONSE", productoId, 1, success);

        if (success) {
            broadcastCatalogo();
        }
    }

    private void handleLiberarReserva(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            sendError("Payload de LIBERAR_RESERVA incompleto");
            return;
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        int cantidad = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
        System.out.println("[" + getName() + "] Liberando reserva de producto " + productoId + " (cantidad " + cantidad + ")...");

        try {
            ProductosDAO.liberarReserva(productoId, cantidad);
            sendReservaResponse("LIBERAR_RESERVA_RESPONSE", productoId, cantidad, true);
            broadcastCatalogo();
        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al liberar reserva: " + e.getMessage());
            sendReservaResponse("LIBERAR_RESERVA_RESPONSE", productoId, cantidad, false);
        }
    }

    private void handleFinalizarReserva(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            sendError("Payload de FINALIZAR_RESERVA incompleto");
            return;
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        int cantidad = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
        System.out.println("[" + getName() + "] Finalizando reserva de producto " + productoId + " (cantidad " + cantidad + ")...");

        try {
            ProductosDAO.finalizarReserva(productoId, cantidad);
            sendReservaResponse("FINALIZAR_RESERVA_RESPONSE", productoId, cantidad, true);
            broadcastCatalogo();
        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al finalizar reserva: " + e.getMessage());
            sendReservaResponse("FINALIZAR_RESERVA_RESPONSE", productoId, cantidad, false);
        }
    }

    private void sendReservaResponse(String type, int productoId, int cantidad, boolean success) {
        writer.println(GeneradorJSON.generarReservaResponse(type, productoId, cantidad, success));
    }

    /**
     * Orquestador de peticiones.
     * Lee el "type" del JSON enviado por el móvil y llama al método
     * correspondiente.
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

                case "GET_MENU":
                    handleGetMenu();
                    break;
                
                case "GET_PEDIDOS_USUARIO":
                    handleGetPedidosUsuario(peticion.getAsJsonObject("payload"));
                    break;

                case "RESERVAR_PRODUCTO":
                    handleReservarProducto(peticion.getAsJsonObject("payload"));
                    break;

                case "LIBERAR_RESERVA":
                    handleLiberarReserva(peticion.getAsJsonObject("payload"));
                    break;

                case "FINALIZAR_RESERVA":
                    handleFinalizarReserva(peticion.getAsJsonObject("payload"));
                    break;

                case "CREAR_PEDIDO":
                    handleCrearPedido(peticion.getAsJsonObject("payload"));
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
            Servidor.broadcast(GeneradorJSON.generarMesaUpdated(id, estadoStr.toUpperCase()));
        } else {
            sendError("No se pudo actualizar la mesa en la base de datos");
        }
    }

    /**
     * Envía el catálogo actualizado a todos los clientes (broadcast)
     */
    private void broadcastCatalogo() {
        ArrayList<CategoriaPlato> lista = CategoriasDAO.categoriasplatos();
        String json = GeneradorJSON.generarMenuUpdated(lista);
        Servidor.broadcast(json);
        System.out.println("[" + getName() + "] Catálogo actualizado y enviado a todos los clientes (" + lista.size() + " categorías)");
    }

    /**
     * Envía la lista completa de pedidos a todos los clientes (broadcast)
     */
    private void broadcastPedidos() {
        ArrayList<Pedidos> lista = PedidosDAO.obtenerTodos();
        Servidor.broadcast(GeneradorJSON.generarPedidosUpdated(lista));
        System.out.println("[" + getName() + "] Lista de pedidos actualizada y broadcast enviado (" + lista.size() + " pedidos)");
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
        writer.println(GeneradorJSON.generarMesasResponse(listaMesas));
        System.out.println("[" + getName() + "] Lista de mesas enviada (" + listaMesas.size() + " mesas)");
    }

    /**
     * Obtiene el menú (categorías y productos) y lo envía en formato jerárquico
     */
    private void handleGetMenu() {
        System.out.println("[" + getName() + "] Obteniendo menú...");

        ArrayList<CategoriaPlato> lista = CategoriasDAO.categoriasplatos();
        writer.println(GeneradorJSON.generarMenuResponse(lista));
        System.out.println("[" + getName() + "] Menú enviado (" + lista.size() + " categorías)");
    }

    /**
     * Crea un pedido y sus detalles en la base de datos
     */
    private void handleCrearPedido(JsonObject payload) {
        if (payload == null || !payload.has("mesaId") || !payload.has("usuarioId") || !payload.has("items")) {
            sendError("Payload de CREAR_PEDIDO incompleto");
            return;
        }

        int mesaId = payload.get("mesaId").getAsInt();
        int usuarioId = payload.get("usuarioId").getAsInt();
        JsonArray items = payload.getAsJsonArray("items");

        System.out.println("[" + getName() + "] Creando pedido para mesa " + mesaId + " por usuario " + usuarioId + "...");

        try {
            // 1. Crear la cabecera del pedido
            Pedidos nuevoPedido = new Pedidos(mesaId, usuarioId, new java.sql.Timestamp(System.currentTimeMillis()), EstadoPedido.ABIERTA);
            int pedidoId = PedidosDAO.insertarPedido(nuevoPedido);

            if (pedidoId == -1) {
                sendError("No se pudo crear la cabecera del pedido");
                return;
            }

            // 2. Crear los detalles del pedido
            boolean exitoDetalles = true;
            for (int i = 0; i < items.size(); i++) {
                JsonObject itemJson = items.get(i).getAsJsonObject();
                int productoId = itemJson.get("id").getAsInt();
                int cantidad = itemJson.get("cantidad").getAsInt();

                DetallesPedido detalle = new DetallesPedido(
                    pedidoId,
                    productoId,
                    cantidad,
                    EstadoDetallePedido.PENDIENTE,
                    new java.sql.Timestamp(System.currentTimeMillis())
                );
                
                if (!DetallesPedidoDAO.insertarDetallePedido(detalle)) {
                    exitoDetalles = false;
                }
            }

            // 3. Responder al cliente
            writer.println(GeneradorJSON.generarCrearPedidoResponse(exitoDetalles, pedidoId));
            System.out.println("[" + getName() + "] Pedido " + pedidoId + " creado con " + (exitoDetalles ? "éxito" : "errores parciales"));

            // 4. Notificar a todos los clientes que hay una actualización en los pedidos
            broadcastPedidos();

        } catch (Exception e) {
            System.err.println("[" + getName() + "] Error al crear pedido: " + e.getMessage());
            sendError("Error interno al procesar el pedido: " + e.getMessage());
        }
    }

    /**
     * Obtiene los pedidos asignados a un usuario específico
     */
    private void handleGetPedidosUsuario(JsonObject payload) {
        if (payload == null || !payload.has("usuarioId")) {
            sendError("Payload de GET_PEDIDOS_USUARIO incompleto");
            return;
        }

        int usuarioId = payload.get("usuarioId").getAsInt();
        System.out.println("[" + getName() + "] Obteniendo pedidos para el usuario " + usuarioId + "...");

        ArrayList<Pedidos> lista = PedidosDAO.obtenerPorUsuario(usuarioId);
        writer.println(GeneradorJSON.generarPedidosUsuarioResponse(lista));
        System.out.println("[" + getName() + "] Lista de pedidos enviada para el usuario " + usuarioId + " (" + lista.size() + " pedidos)");
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

        // Enviamos la respuesta
        writer.println(GeneradorJSON.generarLoginResponse(usuarioValidado, pass));
        
        if (usuarioValidado != null) {
            System.out.println("[" + getName() + "] Login OK para " + user);
        } else {
            System.out.println("[" + getName() + "] Login fallido para " + user);
        }
    }

    /**
     * Utilidad para enviar mensajes de error genéricos al móvil
     */
    private void sendError(String mensaje) {
        if (writer != null) {
            writer.println(GeneradorJSON.generarError(mensaje));
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
