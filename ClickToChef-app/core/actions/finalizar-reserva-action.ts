import socketClient from "../socket/SocketClient";

//Acción para finalizar una reserva
export const finalizarReservaAction = async (productoId: number, cantidad: number = 1) => {
  try {
    //Enviar solicitud al servidor
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
