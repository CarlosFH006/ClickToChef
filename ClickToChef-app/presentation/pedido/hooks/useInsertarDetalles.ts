import { insertarDetallesAction } from '../../../core/actions/insertar-detalles-action';
import { useOrderStore } from '../../../store/useOrderStore';

const useInsertarDetalles = () => {
    const { clearOrder } = useOrderStore();

    const insertarDetalles = async (pedidoId: number) => {
        //Lanzar el action de insertar detalles
        const success = await insertarDetallesAction(pedidoId);
        if (success) {
            //Si se insertaron los detalles, limpiar el pedido del store
            clearOrder();
        }
        return success;
    };

    return { insertarDetalles };
};

export default useInsertarDetalles;
