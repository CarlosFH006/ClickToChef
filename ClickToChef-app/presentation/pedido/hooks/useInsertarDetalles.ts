import { insertarDetallesAction } from '../../../core/actions/insertar-detalles-action';
import { finalizarReservaAction } from '../../../core/actions/finalizar-reserva-action';
import { useOrderStore } from '../../../store/useOrderStore';

const useInsertarDetalles = () => {
    const { items, clearOrder } = useOrderStore();

    const insertarDetalles = async (pedidoId: number) => {
        //Insertar los detalles del pedido
        const success = await insertarDetallesAction(pedidoId);

        if (success) {
            //Finalizar la reserva de los productos
            for (const item of items) {
                await finalizarReservaAction(item.id, item.cantidad);
            }
            //Limpiar el pedido
            clearOrder();
        }

        return success;
    };

    return { insertarDetalles };
};

export default useInsertarDetalles;
