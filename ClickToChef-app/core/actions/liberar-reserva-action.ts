import socketClient from "../socket/SocketClient";

//Acción para liberar una reserva
export const liberarReservaAction = async (productoId: number, cantidad: number = 1) => {
  try {
    //Enviar solicitud al servidor
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
