import { create } from 'zustand';
import { Alert } from 'react-native';
import { DetallePedido, Pedidos } from '../type/pedidos-interface';

//Almacenar el estado global de los pedidos
interface PedidosState {
  pedidos: Pedidos[];
  isLoading: boolean;

  // Acciones
  setPedidos: (pedidos: Pedidos[]) => void;
  setLoading: (loading: boolean) => void;
  updateDetallePedido: (detalle: DetallePedido) => void;
  upsertPedido: (pedido: Pedidos) => void;
  removePedido: (id: number) => void;
}

export const usePedidosStore = create<PedidosState>((set) => ({
  pedidos: [],
  isLoading: false,

  setPedidos: (pedidos) => set({ pedidos, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  //Actualizar el detalle de un pedido
  updateDetallePedido: (detalle) => {
    set((state) => {
      //Buscar el pedido afectado
      const pedidoAfectado = state.pedidos.find(p => p.id === detalle.pedidoId);

      //Si el detalle está listo, mostrar alerta
      if (detalle.estado === 'LISTO' && pedidoAfectado) {
        Alert.alert(
          "Plato listo para servir",
          `${detalle.nombreProducto} del pedido #${detalle.pedidoId} listo para servir.`
        );
      }

      return {
        //Recorrer los pedidos
        pedidos: state.pedidos.map(p => {
          //Si el pedido no es el afectado, devolverlo sin cambios
          if (p.id !== detalle.pedidoId) return p;

          //Buscar el detalle en el pedido
          const exists = p.detalles.some(d => d.id === detalle.id);
          //Si el detalle existe, actualizarlo, si no, añadirlo
          return {
            //Mantener las propiedades del pedido
            ...p,
            //Actualizar o añadir el detalle
            detalles: exists
              ? p.detalles.map(d => d.id === detalle.id ? detalle : d)
              : [...p.detalles, detalle]
          };
        })
      };
    });
  },

  //Insertar o actualizar un pedido
  upsertPedido: (pedido) => set((state) => {
    //Buscar si el pedido existe
    const exists = state.pedidos.some(p => p.id === pedido.id);
    //Si existe, actualizarlo, si no, añadirlo
    return {
      pedidos: exists
        ? state.pedidos.map(p => p.id === pedido.id ? pedido : p)
        : [...state.pedidos, pedido]
    };
  }),

  //Eliminar un pedido
  removePedido: (id) => set((state) => ({
    //Filtrar los pedidos y eliminar el que tenga el id pasado por parámetro
    pedidos: state.pedidos.filter(p => p.id !== id)
  })),
}));


