import socketClient from '../socket/SocketClient';

export const updateEstadoDetalleAction = (id: number, estado: string) => {
  socketClient.send({
    type: 'UPDATE_ESTADO_DETALLE',
    payload: { id, estado }
  });
};
