import socketClient from "../socket/SocketClient";
import { useOrderStore } from "../../store/useOrderStore";
import { useAuthStore } from "../../presentation/auth/store/useAuthStore";

/**
 * Envía el pedido actual al servidor para ser procesado.
 * La lógica de stock y estado de mesa se maneja por separado según requerimiento.
 */
export const crearPedidoAction = async () => {
    const { mesaId, items } = useOrderStore.getState();
    const { user } = useAuthStore.getState();

    if (!mesaId || !user || items.length === 0) {
        console.warn("[crearPedidoAction] Datos insuficientes para crear el pedido", { mesaId, user, itemsCount: items.length });
        return false;
    }

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
