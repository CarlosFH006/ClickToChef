import { Producto } from '../../../type/menu-inetrface';
import { ProductoPedido } from '../../../type/pedido-interface';
import { useOrderStore } from '../../../store/useOrderStore';
import { reservarProductoAction } from '../../../core/actions/reservar-producto-action';
import { liberarReservaAction } from '../../../core/actions/liberar-reserva-action';

export const useProductoActions = (producto: Producto | ProductoPedido) => {
  const { addItem, updateQuantity, items } = useOrderStore();

  const disponible = 'disponible' in producto ? producto.disponible : true;
  const cantidad = items.find(item => item.id === producto.id)?.cantidad ?? 0;

  const handleAdd = () => {
    if (!disponible) return;
    if (cantidad === 0) {
      addItem(producto);
    } else {
      updateQuantity(producto.id, 1);
    }
    reservarProductoAction(producto.id, 1);
  };

  const handleRemove = () => {
    if (cantidad > 0) {
      updateQuantity(producto.id, -1);
      liberarReservaAction(producto.id, 1);
    }
  };

  return { handleAdd, handleRemove, disponible, cantidad };
};