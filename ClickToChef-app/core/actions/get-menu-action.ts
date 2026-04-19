import { useMenuStore } from "../../store/useMenuStore";
import socketClient from "../socket/SocketClient";

//Acción para obtener el menú
export const getMenuAction = async () => {
  try {
    //Establecer loading mientras carga el menú
    useMenuStore.getState().setLoading(true);
    //Enviar solicitud al servidor
    socketClient.send({
      type: 'GET_MENU',
      payload: {}
    });
    
    return true;
  } catch (error) {
    console.error("Error en getMenuAction:", error);
    //Establecer loading en false
    useMenuStore.getState().setLoading(false);
    return false;
  }
};