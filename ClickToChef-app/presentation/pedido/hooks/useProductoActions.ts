import { Producto } from '../../../type/menu-inetrface';
import { ProductoPedido } from '../../../type/pedido-interface';
import { useOrderStore } from '../../../store/useOrderStore';
import { reservarProductoAction } from '../../../core/actions/reservar-producto-action';
import { liberarReservaAction } from '../../../core/actions/liberar-reserva-action';

//Funciones para reservar, liberar y actualizar la cantidad de un producto
export const useProductoActions = (producto: Producto | ProductoPedido) => {
  const { addItem, updateQuantity, items } = useOrderStore();

  const disponible = 'disponible' in producto ? producto.disponible : true;
  const cantidad = items.find(item => item.id === producto.id)?.cantidad ?? 0;

  const handleAdd = () => {
    //Si no esta disponible, no se puede añadir
    if (!disponible) return;
    if (cantidad === 0) {
      //Añadir el producto al pedido
      addItem(producto);
    } else {
      //Actualizar la cantidad del producto
      updateQuantity(producto.id, 1);
    }
    //Reservar el producto
    reservarProductoAction(producto.id, 1);
  };

  const handleRemove = () => {
    //Si la cantidad es mayor a 0, se puede eliminar el producto
    if (cantidad > 0) {
      updateQuantity(producto.id, -1);
      //Liberar la reserva del producto
      liberarReservaAction(producto.id, 1);
    }
  };

  return { handleAdd, handleRemove, disponible, cantidad };
};