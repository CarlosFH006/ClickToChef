package org.example.Servidor;

import com.google.gson.*;
import org.java_websocket.WebSocket;

public class WebSocketHandler {

    private static final Gson gson = new Gson();

    public static void process(WebSocket conn, String json) {
        try {
            //Convierte el mensaje recibido en JSON
            JsonObject peticion = gson.fromJson(json, JsonObject.class);

            //Comprueba que la peticion tiene Type
            if (!peticion.has("type")) {
                conn.send(GeneradorJSON.generarError("Formato de petición inválido: falta campo 'type'"));
                return;
            }

            String tipo = peticion.get("type").getAsString();

            //Comprueba si tiene contenido y si es un JSON y si no tiene lo pone en null
            JsonObject payload = peticion.has("payload") && peticion.get("payload").isJsonObject()
                    ? peticion.getAsJsonObject("payload") : null;
            String respuesta;

            //Genera la respuesta según el tipo de mensaje
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
                case "INSERTAR_DETALLES":
                    respuesta = FuncionesServidor.procesarInsertarDetalles(payload);
                    break;
                case "UPDATE_ESTADO_DETALLE":
                    respuesta = FuncionesServidor.procesarUpdateEstadoDetalle(payload);
                    break;
                case "GET_DETALLES_PEDIDO":
                    respuesta = FuncionesServidor.procesarGetDetallesPedido();
                    break;
                case "GET_PEDIDOS_ADMIN":
                    respuesta = FuncionesServidor.procesarGetPedidosAdmin();
                    break;
                case "GET_USUARIOS":
                    respuesta = FuncionesServidor.procesarGetUsuarios();
                    break;
                case "GET_INGREDIENTES":
                    respuesta = FuncionesServidor.procesarGetIngredientes();
                    break;
                case "GET_TICKETS":
                    respuesta = FuncionesServidor.procesarGetTickets();
                    break;
                case "CERRAR_MESA":
                    respuesta = FuncionesServidor.procesarCerrarMesa(payload);
                    break;
                case "ACTUALIZAR_CAPACIDAD_MESA":
                    respuesta = FuncionesServidor.procesarActualizarCapacidadMesa(payload);
                    break;
                case "CREAR_CATEGORIA":
                    respuesta = FuncionesServidor.procesarCrearCategoria(payload);
                    break;
                case "CREAR_USUARIO":
                    respuesta = FuncionesServidor.procesarCrearUsuario(payload);
                    break;
                case "CAMBIAR_PASSWORD":
                    respuesta = FuncionesServidor.procesarCambiarPassword(payload);
                    break;
                default:
                    System.out.println("[WebSocket] Tipo desconocido: " + tipo);
                    respuesta = GeneradorJSON.generarError("Acción no reconocida en el servidor");
            }

            if (respuesta != null) {
                conn.send(respuesta);
            }

        } catch (Exception e) {
            System.err.println("[WebSocket] Error al parsear JSON: " + e.getMessage());
            conn.send(GeneradorJSON.generarError("Error interno procesando JSON"));
        }
    }
}
