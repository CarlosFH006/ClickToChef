import socketClient from "../socket/SocketClient";

//Acción para reservar un producto
export const reservarProductoAction = async (productoId: number, cantidad: number) => {
  try {
    //Enviar solicitud al servidor
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
