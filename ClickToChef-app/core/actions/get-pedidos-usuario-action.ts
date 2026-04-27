import socketClient from "../socket/SocketClient";
import { usePedidosStore } from "../../store/usePedidosStore";

//Acción para obtener los pedidos de un usuario
export const getPedidosUsuarioAction = async (usuarioId: number) => {
  try {
    //Establecer loading mientras carga los pedidos
    usePedidosStore.getState().setLoading(true);
    //Enviar solicitud al servidor
    socketClient.send({
      type: 'GET_PEDIDOS_USUARIO',
      payload: { usuarioId }
    }); 
    return true;
  } catch (error) {
    console.error("Error en getPedidosUsuarioAction:", error);
    //Establecer loading en false
    usePedidosStore.getState().setLoading(false);
    return false;
  }
};
