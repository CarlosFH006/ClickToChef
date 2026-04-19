import socketClient from "../socket/SocketClient";

//Acción para iniciar sesión
export const authLogin = async (username: string, pass: string) => {
  try {
    //Enviar solicitud al servidor
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