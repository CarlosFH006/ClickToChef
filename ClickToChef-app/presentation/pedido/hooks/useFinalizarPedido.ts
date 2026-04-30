import { crearPedidoAction } from '../../../core/actions/crear-pedido-action';
import { updateMesaStatusAction } from '../../../core/actions/update-mesa-status-action';
import { useOrderStore } from '../../../store/useOrderStore';

const useFinalizarPedido = () => {
    const { mesaId, clearOrder } = useOrderStore();

    const finalizarPedido = async () => {
        const success = await crearPedidoAction();

        if (success) {
            if (mesaId) {
                await updateMesaStatusAction(mesaId, 'OCUPADA');
            }
            clearOrder();
        }

        return success;
    };

    return {
        finalizarPedido
    };
}

export default useFinalizarPedido;