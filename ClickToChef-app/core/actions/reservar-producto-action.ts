import socketClient from "../socket/SocketClient";

export const reservarProductoAction = async (productoId: number, cantidad: number) => {
  try {
    socketClient.send({
      type: 'RESERVAR_PRODUCTO',
      payload: {
        productoId,
        cantidad
      }
    });
    return true;
  } catch (error) {
    console.error("Error en reservarProductoAction:", error);
    return false;
  }
};
