import socketClient from '../socket/SocketClient';

export const eliminarDetalleAction = (detalleId: number) => {
  socketClient.send({
    type: 'ELIMINAR_DETALLE',
    payload: { id: detalleId },
  });
};