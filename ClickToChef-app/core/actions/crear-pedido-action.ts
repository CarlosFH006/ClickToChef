import socketClient from "../socket/SocketClient";
import { useOrderStore } from "../../store/useOrderStore";
import { useAuthStore } from "../../presentation/auth/store/useAuthStore";

//Acción para crear un pedido
export const crearPedidoAction = async () => {
    //Obtener datos del pedido y del usuario
    const { mesaId, items } = useOrderStore.getState();
    const { user } = useAuthStore.getState();

    //Si no hay datos suficientes, mostrar error
    if (!mesaId || !user || items.length === 0) {
        console.warn("[crearPedidoAction] Datos insuficientes para crear el pedido", { mesaId, user, itemsCount: items.length });
        return false;
    }

    //Enviar solicitud al servidor
    try {
        socketClient.send({
            type: 'CREAR_PEDIDO',
            payload: {
                mesaId,
                usuarioId: user.id,
                items: items.map(item => ({
                    id: item.id,
                    cantidad: item.cantidad,
                    notas: item.notas ?? '',
                }))
            }
        });

        console.log("[crearPedidoAction] Solicitud de creación de pedido enviada.");
        return true;
    } catch (error) {
        console.error("[crearPedidoAction] Error al enviar la solicitud:", error);
        return false;
    }
};
