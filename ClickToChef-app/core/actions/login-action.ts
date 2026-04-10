import socketClient from "../socket/SocketClient";

export const authLogin = async (username: string, pass: string) => {
  try {
    // 1. Enviamos la petición al servidor Java
    socketClient.send({
      type: 'LOGIN',
      payload: { username, pass }
    });

    // Nota: El Store y la UI reaccionarán automáticamente cuando 
    // llegue la respuesta del Socket a través del listener global.
    return true; 
  } catch (error) {
    console.error("Error en authLogin Action:", error);
    return false;
  }
};