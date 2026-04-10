import socketClient from "../socket/SocketClient";

/**
 * Solicita la lista de todas las mesas al servidor Java.
 * La respuesta será manejada por el listener global en SocketClient.js.
 */
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
