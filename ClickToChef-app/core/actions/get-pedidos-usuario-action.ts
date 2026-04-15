import socketClient from "../socket/SocketClient";
import { usePedidosStore } from "../../store/usePedidosStore";

export const getPedidosUsuarioAction = async (usuarioId: number) => {
  try {
    usePedidosStore.getState().setLoading(true);
    socketClient.send({
      type: 'GET_PEDIDOS_USUARIO',
      payload: { usuarioId }
    });
    return true;
  } catch (error) {
    console.error("Error en getPedidosUsuarioAction:", error);
    usePedidosStore.getState().setLoading(false);
    return false;
  }
};
