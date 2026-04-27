import socketClient from '../socket/SocketClient';

//Enviar mensaje para actualizar el estado de un detalle del pedido
export const updateEstadoDetalleAction = (id: number, estado: string): boolean => {
  try {
    socketClient.send({
      type: 'UPDATE_ESTADO_DETALLE',
      payload: { id, estado }
    });
    return true;
  } catch (error) {
    console.error('[updateEstadoDetalleAction] Error al enviar:', error);
    return false;
  }
};
