import socketClient from '../socket/SocketClient';

export const eliminarDetalleAction = (detalleId: number): boolean => {
  try {
    socketClient.send({
      type: 'ELIMINAR_DETALLE',
      payload: { id: detalleId },
    });
    return true;
  } catch (error) {
    console.error('[eliminarDetalleAction] Error al enviar:', error);
    return false;
  }
};