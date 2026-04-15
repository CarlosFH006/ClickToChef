import socketClient from "../socket/SocketClient";

export const getMesasAction = async () => {
  try {
    socketClient.send({
      type: 'GET_MESAS',
      payload: {}
    });
    return true;
  } catch (error) {
    console.error("Error en getMesasAction:", error);
    return false;
  }
};
