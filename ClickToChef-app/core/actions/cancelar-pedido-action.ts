import socketClient from "../socket/SocketClient";

export const cancelarPedidoAction = (pedidoId: number) => {
    try {
        socketClient.send({
            type: 'CANCELAR_PEDIDO',
            payload: { pedidoId }
        });
        return true;
    } catch (error) {
        console.error("[cancelarPedidoAction] Error al enviar la solicitud:", error);
        return false;
    }
};