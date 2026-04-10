import socketClient from "../socket/SocketClient";

export const updateMesaStatusAction = async (id: number, estado: string) => {
  try {
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
