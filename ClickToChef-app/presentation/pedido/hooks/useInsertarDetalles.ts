import { insertarDetallesAction } from '../../../core/actions/insertar-detalles-action';
import { useOrderStore } from '../../../store/useOrderStore';

const useInsertarDetalles = () => {
    const { clearOrder } = useOrderStore();

    const insertarDetalles = async (pedidoId: number) => {
        const success = await insertarDetallesAction(pedidoId);
        if (success) {
            clearOrder();
        }
        return success;
    };

    return { insertarDetalles };
};

export default useInsertarDetalles;
