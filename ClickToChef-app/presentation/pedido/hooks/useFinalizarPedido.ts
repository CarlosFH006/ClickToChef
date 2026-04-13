import { crearPedidoAction } from '../../../core/actions/crear-pedido-action';
import { updateMesaStatusAction } from '../../../core/actions/update-mesa-status-action';
import { finalizarReservaAction } from '../../../core/actions/finalizar-reserva-action';
import { useOrderStore } from '../../../store/pedido-store';

const useFinalizarPedido = () => {
    const { mesaId, items, clearOrder } = useOrderStore();

    const finalizarPedido = async () => {
        // 1. Realizar la llamada a crearPedidoAction
        const success = await crearPedidoAction();

        if (success) {
            // 2. Si ha ido bien, cambiar el estado de la mesa a OCUPADA
            if (mesaId) {
                await updateMesaStatusAction(mesaId, 'OCUPADA');
            }

            // 3. Realizar la llamada a finalizar-reserva-action con los datos de pedido-store
            // Iteramos sobre los items para finalizar sus reservas individuales
            for (const item of items) {
                await finalizarReservaAction(item.id, item.cantidad);
            }

            // 4. Una vez hecho esto, eliminar el contenido de pedido-store
            clearOrder();
        }

        return success;
    };

    return {
        finalizarPedido
    };
}

export default useFinalizarPedido;