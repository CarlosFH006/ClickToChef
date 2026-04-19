import { useMesaStore } from "../../store/useMesaStore";
import socketClient from "../socket/SocketClient";

//Acción para obtener las mesas
export const getMesasAction = async () => {
  try {
    //Establecer loading mientras carga las mesas
    useMesaStore.getState().setLoading(true);
    //Enviar solicitud al servidor
    socketClient.send({
      type: 'GET_MESAS',
      payload: {}
    });
    return true;
  } catch (error) {
    console.error("Error en getMesasAction:", error);
    return false;
  }
};
