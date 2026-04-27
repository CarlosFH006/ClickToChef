import socketClient from "../socket/SocketClient";

//Acción para actualizar el estado de una mesa
export const updateMesaStatusAction = async (id: number, estado: string) => {
  try {
    //Enviar solicitud al servidor
    socketClient.send({
      type: 'UPDATE_MESA_STATUS',
      payload: {
        id,
        estado
      }
    });
    return true;
  } catch (error) {
    console.error("Error en updateMesaStatusAction:", error);
    return false;
  }
};
