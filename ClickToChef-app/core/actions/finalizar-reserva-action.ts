import socketClient from "../socket/SocketClient";

export const finalizarReservaAction = async (productoId: number, cantidad: number = 1) => {
  try {
    socketClient.send({
      type: 'FINALIZAR_RESERVA',
      payload: {
        productoId,
        cantidad
      }
    });
    return true;
  } catch (error) {
    console.error("Error en finalizarReservaAction:", error);
    return false;
  }
};
