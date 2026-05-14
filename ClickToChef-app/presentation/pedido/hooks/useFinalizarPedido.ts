import { crearPedidoAction } from '../../../core/actions/crear-pedido-action';
import { updateMesaStatusAction } from '../../../core/actions/update-mesa-status-action';
import { useOrderStore } from '../../../store/useOrderStore';

const useFinalizarPedido = () => {
    const { mesaId, clearOrder } = useOrderStore();

    const finalizarPedido = async () => {
        //Lanzar el action de crear pedido
        const success = await crearPedidoAction();

        if (success) {
            //Si se creó el pedido, actualizar el estado de la mesa
            if (mesaId) {
                await updateMesaStatusAction(mesaId, 'OCUPADA');
            }
            //Limpiar el pedido del store
            clearOrder();
        }

        return success;
    };

    return {
        finalizarPedido
    };
}

export default useFinalizarPedido;