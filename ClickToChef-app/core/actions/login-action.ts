import socketClient from "../socket/SocketClient";

export const authLogin = async (username: string, pass: string) => {
  try {
    socketClient.send({
      type: 'LOGIN',
      payload: { username, pass }
    });

    return true; 
  } catch (error) {
    console.error("Error en authLogin Action:", error);
    return false;
  }
};