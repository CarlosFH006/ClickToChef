import socketClient from "../socket/SocketClient";

export const liberarReservaAction = async (productoId: number, cantidad: number = 1) => {
  try {
    socketClient.send({
      type: 'LIBERAR_RESERVA',
      payload: {
        productoId,
        cantidad
      }
    });
    return true;
  } catch (error) {
    console.error("Error en liberarReservaAction:", error);
    return false;
  }
};
