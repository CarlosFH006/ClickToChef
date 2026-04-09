import socketClient from "../socket/SocketClient";

export const authLogin = async (username: string, pass: string) => {
  try {
    // 1. Enviamos la petición al servidor Java
    socketClient.send({
      type: 'LOGIN',
      payload: { username, pass }
    });

    // Nota: Como los Sockets son asíncronos, aquí podrías implementar 
    // una Promise que espere la respuesta o simplemente dejar que 
    // el listener global del Socket actualice el Store.
    return true; 
  } catch (error) {
    console.error("Error en authLogin Action:", error);
    return false;
  }
};