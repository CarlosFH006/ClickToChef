package org.example.Servidor;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.example.DAO.*;
import org.example.Odoo.FuncionesOdoo;
import org.example.DTO.*;
import java.sql.Timestamp;
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
        boolean exito;
        if (nuevoEstado == EstadoMesa.RESERVADA) {
            exito = MesasDAO.reservarMesa(id);
        } else if (nuevoEstado == EstadoMesa.RETIRADA) {
            exito = MesasDAO.retirarMesa(id);
        } else if (nuevoEstado == EstadoMesa.LIBRE) {
            // activarMesa solo actualiza si estaba RETIRADA; si no, usa el método genérico
            exito = MesasDAO.activarMesa(id) || MesasDAO.actualizarEstadoMesa(id, nuevoEstado);
        } else {
            exito = MesasDAO.actualizarEstadoMesa(id, nuevoEstado);
        }

        if (exito) {
            Servidor.broadcast(GeneradorJSON.generarMesaUpdated(id, estadoStr.toUpperCase()));
        }
        return GeneradorJSON.generarUpdateMesaStatusResponse(exito, id);
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
        if (success) {
            broadcastNoDisponibles();
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
            broadcastNoDisponibles();
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
            broadcastIngredientes();
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
            broadcastPedido(pedidoId);
            broadcastDetallesPedido();

            return GeneradorJSON.generarCrearPedidoResponse(exitoDetalles, pedidoId);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al crear pedido: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al procesar el pedido: " + e.getMessage());
        }
    }

    public static String procesarInsertarDetalles(JsonObject payload) {
        if (payload == null || !payload.has("pedidoId") || !payload.has("items")) {
            return GeneradorJSON.generarError("Payload de INSERTAR_DETALLES incompleto");
        }

        int pedidoId = payload.get("pedidoId").getAsInt();
        JsonArray items = payload.getAsJsonArray("items");

        System.out.println("[FuncionesServidor] Insertando " + items.size() + " detalle(s) en pedido " + pedidoId);

        try {
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

            if (exitoDetalles) {
                broadcastPedido(pedidoId);
                broadcastDetallesPedido();
            }

            System.out.println("[FuncionesServidor] Detalles insertados en pedido " + pedidoId + (exitoDetalles ? " con éxito" : " con errores"));
            return GeneradorJSON.generarCrearPedidoResponse(exitoDetalles, pedidoId);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al insertar detalles: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al insertar detalles: " + e.getMessage());
        }
    }

    public static String procesarUpdateEstadoDetalle(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("estado")) {
            return GeneradorJSON.generarError("Payload de UPDATE_ESTADO_DETALLE incompleto");
        }

        int id = payload.get("id").getAsInt();
        EstadoDetallePedido nuevoEstado = EstadoDetallePedido.valueOf(payload.get("estado").getAsString());

        boolean success = DetallesPedidoDAO.updateEstado(id, nuevoEstado);
        if (success) {
            broadcastDetalleActualizado(id, nuevoEstado);
        }

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

    public static String procesarGetPedidosAdmin() {
        try {
            ArrayList<Pedidos> lista = PedidosDAO.obtenerTodos();
            System.out.println("[FuncionesServidor] Pedidos admin obtenidos: " + lista.size());
            return GeneradorJSON.generarPedidosAdminResponse(lista);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al obtener pedidos admin: " + e.getMessage());
            return GeneradorJSON.generarError("Error al obtener pedidos: " + e.getMessage());
        }
    }

    public static String procesarGetUsuarios() {
        try {
            ArrayList<Usuarios> lista = UsuariosDAO.obtenerTodosSinPassword();
            System.out.println("[FuncionesServidor] Usuarios obtenidos: " + lista.size());
            return GeneradorJSON.generarUsuariosResponse(lista);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al obtener usuarios: " + e.getMessage());
            return GeneradorJSON.generarError("Error al obtener usuarios: " + e.getMessage());
        }
    }

    public static String procesarGetIngredientes() {
        try {
            ArrayList<Ingredientes> lista = IngredientesDAO.obtenerTodos();
            System.out.println("[FuncionesServidor] Ingredientes obtenidos: " + lista.size());
            return GeneradorJSON.generarIngredientesResponse(lista);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al obtener ingredientes: " + e.getMessage());
            return GeneradorJSON.generarError("Error al obtener ingredientes: " + e.getMessage());
        }
    }

    public static String procesarGetTickets() {
        try {
            ArrayList<Tickets> lista = TicketsDAO.obtenerTodos();
            System.out.println("[FuncionesServidor] Tickets obtenidos: " + lista.size());
            return GeneradorJSON.generarTicketsResponse(lista);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al obtener tickets: " + e.getMessage());
            return GeneradorJSON.generarError("Error al obtener tickets: " + e.getMessage());
        }
    }

    public static String procesarCerrarMesa(JsonObject payload) {
        if (payload == null || !payload.has("pedidoId") || !payload.has("totalImporte") || !payload.has("metodoPago")) {
            return GeneradorJSON.generarError("Payload de CERRAR_MESA incompleto");
        }

        int pedidoId = payload.get("pedidoId").getAsInt();
        double totalImporte = payload.get("totalImporte").getAsDouble();
        MetodoPago metodoPago;
        try {
            metodoPago = MetodoPago.valueOf(payload.get("metodoPago").getAsString().toUpperCase());
        } catch (IllegalArgumentException e) {
            return GeneradorJSON.generarError("Método de pago inválido: " + payload.get("metodoPago").getAsString());
        }

        System.out.println("[FuncionesServidor] Cerrando mesa para pedido " + pedidoId);

        try {
            Pedidos pedido = PedidosDAO.obtenerPedidoPorId(pedidoId);
            if (pedido == null) {
                return GeneradorJSON.generarError("Pedido " + pedidoId + " no encontrado o ya cerrado");
            }
            int mesaId = pedido.getMesaId();

            Tickets ticket = new Tickets(pedidoId, totalImporte, new Timestamp(System.currentTimeMillis()), "DESCONOCIDA", metodoPago);
            boolean ticketCreado = TicketsDAO.insertarTicket(ticket);
            if (!ticketCreado) {
                return GeneradorJSON.generarError("No se pudo registrar el ticket del pedido " + pedidoId);
            }

            boolean pedidoCerrado = PedidosDAO.cerrarPedido(pedidoId);

            for (DetallesPedido d : pedido.getDetalles()) {
                ProductosDAO.finalizarReserva(d.getProductoId(), d.getCantidad());
            }
            broadcastNoDisponibles();

            MesasDAO.actualizarEstadoMesa(mesaId, EstadoMesa.LIBRE);
            Servidor.broadcast(GeneradorJSON.generarMesaUpdated(mesaId, "LIBRE"));
            WebSocketServidor.broadcastGlobal(GeneradorJSON.generarTicketCreado(pedidoId, totalImporte, payload.get("metodoPago").getAsString().toUpperCase()));
            broadcastPedido(pedidoId);

            String refOdoo = FuncionesOdoo.crearTicketVenta(pedidoId);
            FuncionesOdoo.descontarStockOdoo(pedidoId);
            TicketsDAO.actualizarReferenciaOdoo(pedidoId, refOdoo);

            System.out.println("[FuncionesServidor] Pedido " + pedidoId + " cerrado, ticket registrado, mesa " + mesaId + " liberada");
            return GeneradorJSON.generarCerrarMesaResponse(ticketCreado && pedidoCerrado, pedidoId, totalImporte);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al cerrar mesa: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al cerrar la mesa: " + e.getMessage());
        }
    }

    public static String procesarCancelarPedido(JsonObject payload) {
        if (payload == null || !payload.has("pedidoId")) {
            return GeneradorJSON.generarError("Payload de CANCELAR_PEDIDO incompleto");
        }

        int pedidoId = payload.get("pedidoId").getAsInt();
        System.out.println("[FuncionesServidor] Cancelando pedido " + pedidoId);

        try {
            Pedidos pedido = PedidosDAO.obtenerPedidoPorId(pedidoId);
            if (pedido == null) {
                return GeneradorJSON.generarError("Pedido " + pedidoId + " no encontrado");
            }

            // Verificar que todos los detalles estén en PENDIENTE
            boolean todosEnPendiente = pedido.getDetalles().stream()
                    .allMatch(d -> d.getEstado() == EstadoDetallePedido.PENDIENTE);
            if (!todosEnPendiente) {
                System.out.println("[FuncionesServidor] Pedido " + pedidoId + " no se puede cancelar: hay detalles en preparación o ya servidos");
                return GeneradorJSON.generarCancelarPedidoResponse(false, pedidoId);
            }

            // Restaurar stock de cada detalle del pedido
            for (DetallesPedido d : pedido.getDetalles()) {
                ProductosDAO.liberarReserva(d.getProductoId(), d.getCantidad());
            }

            boolean cancelado = PedidosDAO.cancelarPedido(pedidoId);
            if (!cancelado) {
                return GeneradorJSON.generarError("No se pudo cancelar el pedido " + pedidoId + " (puede que ya no esté abierto)");
            }

            int mesaId = pedido.getMesaId();
            MesasDAO.actualizarEstadoMesa(mesaId, EstadoMesa.LIBRE);
            Servidor.broadcast(GeneradorJSON.generarMesaUpdated(mesaId, "LIBRE"));
            broadcastNoDisponibles();
            broadcastPedido(pedidoId);
            broadcastDetallesPedido();

            System.out.println("[FuncionesServidor] Pedido " + pedidoId + " cancelado, stock restaurado, mesa " + mesaId + " liberada");
            return GeneradorJSON.generarCancelarPedidoResponse(true, pedidoId);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al cancelar pedido: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al cancelar el pedido: " + e.getMessage());
        }
    }

    public static String procesarEliminarDetalle(JsonObject payload) {
        if (payload == null || !payload.has("id")) {
            return GeneradorJSON.generarError("Payload de ELIMINAR_DETALLE incompleto");
        }

        int id = payload.get("id").getAsInt();
        System.out.println("[FuncionesServidor] Eliminando detalle " + id);

        try {
            DetallesPedido detalle = DetallesPedidoDAO.obtenerPorId(id);
            if (detalle == null) {
                return GeneradorJSON.generarEliminarDetalleResponse(false, id);
            }
            if (detalle.getEstado() != EstadoDetallePedido.PENDIENTE) {
                System.out.println("[FuncionesServidor] Detalle " + id + " no está en PENDIENTE, no se puede eliminar");
                return GeneradorJSON.generarEliminarDetalleResponse(false, id);
            }

            ProductosDAO.liberarReserva(detalle.getProductoId(), detalle.getCantidad());
            boolean eliminado = DetallesPedidoDAO.eliminarDetalle(id);

            if (eliminado) {
                broadcastNoDisponibles();
                Servidor.broadcast(GeneradorJSON.generarDetalleDeleted(id));
            }

            System.out.println("[FuncionesServidor] Detalle " + id + (eliminado ? " eliminado" : " no eliminado"));
            return GeneradorJSON.generarEliminarDetalleResponse(eliminado, id);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al eliminar detalle: " + e.getMessage());
            return GeneradorJSON.generarError("Error interno al eliminar el detalle: " + e.getMessage());
        }
    }

    public static String procesarActualizarCapacidadMesa(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("capacidad")) {
            return GeneradorJSON.generarError("Payload de ACTUALIZAR_CAPACIDAD_MESA incompleto");
        }
        try {
            int id = payload.get("id").getAsInt();
            int capacidad = payload.get("capacidad").getAsInt();
            if (capacidad < 1 || capacidad > 99) {
                return GeneradorJSON.generarError("La capacidad debe estar entre 1 y 99");
            }
            boolean success = MesasDAO.actualizarCapacidadMesa(id, capacidad);
            if (success) {
                Servidor.broadcast(GeneradorJSON.generarMesaCapacidadUpdated(id, capacidad));
                System.out.println("[FuncionesServidor] Capacidad mesa " + id + " → " + capacidad);
            }
            return success
                    ? null
                    : GeneradorJSON.generarError("No se pudo actualizar la capacidad de la mesa " + id);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al actualizar capacidad: " + e.getMessage());
            return GeneradorJSON.generarError("Error al actualizar la capacidad: " + e.getMessage());
        }
    }

    public static String procesarCrearCategoria(JsonObject payload) {
        if (payload == null || !payload.has("nombre")) {
            return GeneradorJSON.generarError("Payload de CREAR_CATEGORIA incompleto");
        }
        try {
            String nombre = payload.get("nombre").getAsString().trim();
            if (nombre.isEmpty()) return GeneradorJSON.generarError("El nombre de la categoría no puede estar vacío");
            int id = CategoriasDAO.insertarCategoria(new org.example.DTO.Categorias(nombre));
            if (id == -1) return GeneradorJSON.generarCrearCategoriaResponse(false, -1, nombre);
            Servidor.broadcast(GeneradorJSON.generarNuevaCategoria(id, nombre));
            System.out.println("[FuncionesServidor] Categoría '" + nombre + "' creada con ID: " + id);
            return GeneradorJSON.generarCrearCategoriaResponse(true, id, nombre);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al crear categoría: " + e.getMessage());
            return GeneradorJSON.generarError("Error al crear la categoría: " + e.getMessage());
        }
    }

    public static String procesarCambiarPassword(JsonObject payload) {
        if (payload == null || !payload.has("id") || !payload.has("password")) {
            return GeneradorJSON.generarError("Payload de CAMBIAR_PASSWORD incompleto");
        }
        try {
            int id = payload.get("id").getAsInt();
            String password = payload.get("password").getAsString();
            boolean success = UsuariosDAO.cambiarPassword(id, password);
            System.out.println("[FuncionesServidor] Contraseña del usuario " + id + (success ? " cambiada" : " no cambiada"));
            return GeneradorJSON.generarCambiarPasswordResponse(success);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al cambiar contraseña: " + e.getMessage());
            return GeneradorJSON.generarError("Error al cambiar la contraseña: " + e.getMessage());
        }
    }

    public static String procesarCrearUsuario(JsonObject payload) {
        if (payload == null || !payload.has("username") || !payload.has("password")
                || !payload.has("nombreCompleto") || !payload.has("rol")) {
            return GeneradorJSON.generarError("Payload de CREAR_USUARIO incompleto");
        }
        try {
            RolUsuario rol = RolUsuario.valueOf(payload.get("rol").getAsString().toUpperCase());
            Usuarios usuario = new Usuarios(
                    0,
                    payload.get("username").getAsString(),
                    payload.get("password").getAsString(),
                    payload.get("nombreCompleto").getAsString(),
                    rol
            );
            boolean success = UsuariosDAO.insertarUsuario(usuario);
            System.out.println("[FuncionesServidor] Usuario '" + usuario.getUsername() + "' " + (success ? "creado" : "no creado"));
            return GeneradorJSON.generarCrearUsuarioResponse(success);
        } catch (Exception e) {
            System.err.println("[FuncionesServidor] Error al crear usuario: " + e.getMessage());
            return GeneradorJSON.generarError("Error al crear el usuario: " + e.getMessage());
        }
    }

    //Funciones de broadcast
    private static void broadcastNoDisponibles() {
        ArrayList<Integer> noDisponibles = ProductosDAO.obtenerNoDisponibles();
        Servidor.broadcast(GeneradorJSON.generarStockUpdated(noDisponibles));
        System.out.println("[FuncionesServidor] Stock broadcast (" + noDisponibles.size() + " no disponibles)");
    }

    private static void broadcastDetallesPedido() {
        ArrayList<DetallesPedido> lista = DetallesPedidoDAO.obtenerTodos();
        WebSocketServidor.broadcastGlobal(GeneradorJSON.generarDetallesPedidoResponse(lista));
        System.out.println("[FuncionesServidor] Detalles pedido broadcast (" + lista.size() + " detalles)");
    }

    private static void broadcastPedido(int id) {
        Pedidos pedido = PedidosDAO.obtenerPedidoPorId(id);
        Servidor.broadcast(GeneradorJSON.generarPedidosUpdated(pedido));
        System.out.println("[FuncionesServidor] Pedido broadcast (ID: " + id + ")");
    }

    private static void broadcastIngredientes() {
        ArrayList<Ingredientes> lista = IngredientesDAO.obtenerTodos();
        WebSocketServidor.broadcastGlobal(GeneradorJSON.generarIngredientesResponse(lista));
        System.out.println("[FuncionesServidor] Ingredientes broadcast (" + lista.size() + " ingredientes)");
    }

    private static void broadcastDetalleActualizado(int id, EstadoDetallePedido estado) {
        Servidor.broadcast(GeneradorJSON.generarDetalleUpdated(id, estado));
        System.out.println("[FuncionesServidor] Detalle pedido actualizado broadcast (ID: " + id + ")");
    }
}
