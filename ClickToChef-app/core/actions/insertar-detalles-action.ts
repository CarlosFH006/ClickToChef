import socketClient from "../socket/SocketClient";
import { useOrderStore } from "../../store/useOrderStore";

//Enviar mensaje para insertar los detalles del pedido
export const insertarDetallesAction = async (pedidoId: number) => {
    const { items } = useOrderStore.getState();
    if (items.length === 0) return false;

    try {
        socketClient.send({
            type: 'INSERTAR_DETALLES',
            payload: {
                pedidoId,
                items: items.map(item => ({
                    id: item.id,
                    cantidad: item.cantidad,
                    notas: item.notas ?? '',
                }))
            }
        });
        console.log("[insertarDetallesAction] Solicitud enviada para pedido", pedidoId);
        return true;
    } catch (error) {
        console.error("[insertarDetallesAction] Error:", error);
        return false;
    }
};
