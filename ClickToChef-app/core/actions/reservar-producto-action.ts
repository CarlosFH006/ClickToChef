import socketClient from "../socket/SocketClient";

export const reservarProductoAction = async (productoId: number) => {
  try {
    socketClient.send({
      type: 'RESERVAR_PRODUCTO',
      payload: {
        productoId
      }
    });
    return true;
  } catch (error) {
    console.error("Error en reservarProductoAction:", error);
    return false;
  }
};
