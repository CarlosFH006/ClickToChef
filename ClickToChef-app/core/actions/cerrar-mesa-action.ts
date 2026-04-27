import socketClient from "../socket/SocketClient";

type MetodoPago = 'EFECTIVO' | 'TARJETA';

//Enviar mensaje para cerrar la mesa
export const cerrarMesaAction = (pedidoId: number, totalImporte: number, metodoPago: MetodoPago) => {
    try {
        socketClient.send({
            type: 'CERRAR_MESA',
            payload: { pedidoId, totalImporte, metodoPago }
        });
        console.log("[cerrarMesaAction] Solicitud de cierre enviada.", { pedidoId, totalImporte, metodoPago });
        return true;
    } catch (error) {
        console.error("[cerrarMesaAction] Error al enviar la solicitud:", error);
        return false;
    }
};
