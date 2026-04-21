package org.example.Servidor;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.example.DAO.*;
import org.example.DTO.*;
import java.util.ArrayList;

//Funciones para ejecutar en las llamadas de ServerSocket y de WebSocket
public class FuncionesServidor {

    public static String procesarLogin(JsonObject payload) {
        if (payload == null) {
            return GeneradorJSON.generarError("Payload de login vacío");
        }

        String user = payload.has("username") ? payload.get("username").getAsString() : "";
        String pass = payload.has("pass") ? payload.get("pass").getAsString() : "";

        System.out.println("[FuncionesServidor] Procesando login para: " + user);
        Usuarios usuarioValidado = UsuariosDAO.login(user, pass);
        System.out.println("[FuncionesServidor] Login " + (usuarioValidado != null ? "OK" : "fallido") + " para " + user);

        return GeneradorJSON.generarLoginResponse(usuarioValidado, pass);
    }

    public static String procesarGetMesas() {
        ArrayList<Mesas> lista = MesasDAO.obtenerTodas();
        System.out.println("[FuncionesServidor] Mesas obtenidas: " + lista.size());
        return GeneradorJSON.generarMesasResponse(lista);
    }

    //Si hace broadcast devuelve null, para no enviar respuesta al cliente
    public static String procesarUpdateMesaStatus(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("estado")) {
            return GeneradorJSON.generarError("Payload de actualización incompleto");
        }

        int id = payload.get("id").getAsInt();
        String estadoStr = payload.get("estado").getAsString();
        EstadoMesa nuevoEstado = EstadoMesa.valueOf(estadoStr.toUpperCase());

        System.out.println("[FuncionesServidor] Actualizando mesa " + id + " a " + nuevoEstado);
        boolean exito = MesasDAO.actualizarEstadoMesa(id, nuevoEstado);

        if (exito) {
            Servidor.broadcast(GeneradorJSON.generarMesaUpdated(id, estadoStr.toUpperCase()));
            return null;
        }
        return GeneradorJSON.generarError("No se pudo actualizar la mesa en la base de datos");
    }

    public static String procesarGetMenu() {
        ArrayList<CategoriaPlato> lista = CategoriasDAO.categoriasplatos();
        System.out.println("[FuncionesServidor] Menú obtenido: " + lista.size() + " categorías");
        return GeneradorJSON.generarMenuResponse(lista);
    }

    public static String procesarGetPedidosUsuario(JsonObject payload) {
        if (payload == null || !payload.has("usuarioId")) {
            return GeneradorJSON.generarError("Payload de GET_PEDIDOS_USUARIO incompleto");
        }

        int usuarioId = payload.get("usuarioId").getAsInt();
        ArrayList<Pedidos> lista = PedidosDAO.obtenerPorUsuario(usuarioId);
        System.out.println("[FuncionesServidor] Pedidos para usuario " + usuarioId + ": " + lista.size());
        return GeneradorJSON.generarPedidosUsuarioResponse(lista);
    }

    public static String procesarReservarProducto(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            return GeneradorJSON.generarError("Payload de RESERVAR_PRODUCTO incompleto");
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        int cantidad = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
        System.out.println("[FuncionesServidor] Reservando producto " + productoId + " (cantidad " + cantidad + ")");

        boolean success = ProductosDAO.reservarProducto(productoId, cantidad);
        //Si se completa la reserva llama a su función de broadcast
        if (success) {
            broadcastCatalogo();
        }

        return GeneradorJSON.generarReservaResponse("RESERVAR_PRODUCTO_RESPONSE", productoId, cantidad, success);
    }

    public static String procesarLiberarReserva(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            return GeneradorJSON.generarError("Payload de LIBERAR_RESERVA incompleto");
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        int cantidad = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
        System.out.println("[FuncionesServidor] Liberando reserva producto " + productoId + " (cantidad " + cantidad + ")");

        try {
            ProductosDAO.liberarReserva(productoId, cantidad);
            broadcastCatalogo();
            return GeneradorJSON.generarReservaResponse("LIBERAR_RESERVA_RESPONSE", productoId, cantidad, true);
        } catch (Exception e) {
            //Si falla la liberación de la reserva de stock se devuelve un error
            System.err.println("[FuncionesServidor] Error al liberar reserva: " + e.getMessage());
            return GeneradorJSON.generarReservaResponse("LIBERAR_RESERVA_RESPONSE", productoId, cantidad, false);
        }
    }

    //Este método es similar al anterior pero confirma la reserva y resta el stock
    public static String procesarFinalizarReserva(JsonObject payload) {
        if (payload == null || (!payload.has("productoId") && !payload.has("id"))) {
            return GeneradorJSON.generarError("Payload de FINALIZAR_RESERVA incompleto");
        }

        int productoId = payload.has("productoId") ? payload.get("productoId").getAsInt() : payload.get("id").getAsInt();
        int cantidad = payload.has("cantidad") ? payload.get("cantidad").getAsInt() : 1;
        System.out.println("[FuncionesServidor] Finalizando reserva producto " + productoId + " (cantidad " + cantidad + ")");

        try {
            ProductosDAO.finalizarReserva(productoId, cantidad);
            broadcastCatalogo();
            return GeneradorJSON.generarReservaResponse("FINALIZAR_RESERVA_RESPONSE", productoId, cantidad, true);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al finalizar reserva: " + e.getMessage());
            return GeneradorJSON.generarReservaResponse("FINALIZAR_RESERVA_RESPONSE", productoId, cantidad, false);
        }
    }

    public static String procesarCrearPedido(JsonObject payload) {
        if (payload == null || !payload.has("mesaId") || !payload.has("usuarioId") || !payload.has("items")) {
            return GeneradorJSON.generarError("Payload de CREAR_PEDIDO incompleto");
        }

        int mesaId = payload.get("mesaId").getAsInt();
        int usuarioId = payload.get("usuarioId").getAsInt();
        JsonArray items = payload.getAsJsonArray("items");

        System.out.println("[FuncionesServidor] Creando pedido para mesa " + mesaId + " por usuario " + usuarioId);

        try {
            Pedidos nuevoPedido = new Pedidos(mesaId, usuarioId, new java.sql.Timestamp(System.currentTimeMillis()), EstadoPedido.ABIERTA);
            int pedidoId = PedidosDAO.insertarPedido(nuevoPedido);

            //Si al crear el pedido devuelve un -1 como id muestra el fallo
            if (pedidoId == -1) {
                return GeneradorJSON.generarError("No se pudo crear la cabecera del pedido");
            }

            //Añade los platos al pedido
            boolean exitoDetalles = true;
            for (int i = 0; i < items.size(); i++) {
                JsonObject item = items.get(i).getAsJsonObject();
                DetallesPedido detalle = new DetallesPedido(
                    pedidoId,
                    item.get("id").getAsInt(),
                    item.get("cantidad").getAsInt(),
                    item.has("notas") ? item.get("notas").getAsString() : "",
                    EstadoDetallePedido.PENDIENTE,
                    new java.sql.Timestamp(System.currentTimeMillis())
                );
                if (!DetallesPedidoDAO.insertarDetallePedido(detalle)) {
                    exitoDetalles = false;
                }
            }

            System.out.println("[FuncionesServidor] Pedido " + pedidoId + " creado con " + (exitoDetalles ? "éxito" : "errores parciales"));
            broadcastPedidos();
            broadcastDetallesPedido();

            return GeneradorJSON.generarCrearPedidoResponse(exitoDetalles, pedidoId);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al crear pedido: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al procesar el pedido: " + e.getMessage());
        }
    }

    public static String procesarUpdateEstadoDetalle(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("estado")) {
            return GeneradorJSON.generarError("Payload de UPDATE_ESTADO_DETALLE incompleto");
        }

        int id = payload.get("id").getAsInt();
        EstadoDetallePedido nuevoEstado = EstadoDetallePedido.valueOf(payload.get("estado").getAsString());

        boolean success = DetallesPedidoDAO.updateEstado(id, nuevoEstado);
        if (success) broadcastDetallesPedido();

        return GeneradorJSON.generarUpdateEstadoDetalleResponse(success, id);
    }

    public static String procesarGetDetallesPedido() {
        try {
            ArrayList<DetallesPedido> lista = DetallesPedidoDAO.obtenerTodos();
            System.out.println("[FuncionesServidor] Detalles obtenidos: " + lista.size());
            return GeneradorJSON.generarDetallesPedidoResponse(lista);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al obtener detalles: " + e.getMessage());
            return GeneradorJSON.generarError("Error al obtener detalles: " + e.getMessage());
        }
    }

    //Funciones de broadcast
    private static void broadcastCatalogo() {
        ArrayList<CategoriaPlato> lista = CategoriasDAO.categoriasplatos();
        Servidor.broadcast(GeneradorJSON.generarMenuUpdated(lista));
        System.out.println("[FuncionesServidor] Catálogo broadcast (" + lista.size() + " categorías)");
    }

    private static void broadcastDetallesPedido() {
        ArrayList<DetallesPedido> lista = DetallesPedidoDAO.obtenerTodos();
        Servidor.broadcast(GeneradorJSON.generarDetallesPedidoResponse(lista));
        System.out.println("[FuncionesServidor] Detalles pedido broadcast (" + lista.size() + " detalles)");
    }

    private static void broadcastPedidos() {
        ArrayList<Pedidos> lista = PedidosDAO.obtenerTodos();
        Servidor.broadcast(GeneradorJSON.generarPedidosUpdated(lista));
        System.out.println("[FuncionesServidor] Pedidos broadcast (" + lista.size() + " pedidos)");
    }
}
