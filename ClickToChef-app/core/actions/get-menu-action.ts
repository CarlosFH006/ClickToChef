import socketClient from "../socket/SocketClient";

export const getMenuAction = async () => {
  try {
    socketClient.send({
      type: 'GET_MENU',
      payload: {}
    });
    return true;
  } catch (error) {
    console.error("Error en getMenuAction:", error);
    return false;
  }
};
