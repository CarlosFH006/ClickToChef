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
  updateDetallePedido: (detalle: { id: number; estado: DetallePedido['estado'] }) => void;
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
      //Buscar el pedido afectado escaneando los detalles
      const pedidoAfectado = state.pedidos.find(p => p.detalles.some(d => d.id === detalle.id));

      //Si el detalle está listo, mostrar alerta usando el nombre ya almacenado
      if (detalle.estado === 'LISTO' && pedidoAfectado) {
        const nombre = pedidoAfectado.detalles.find(d => d.id === detalle.id)?.nombreProducto;
        Alert.alert(
          "Plato listo para servir",
          `${nombre} del pedido #${pedidoAfectado.id} listo para servir.`
        );
      }

      return {
        //Recorrer los pedidos y hacer merge solo del estado
        pedidos: state.pedidos.map(p => ({
          ...p,
          detalles: p.detalles.map(d => d.id === detalle.id ? { ...d, estado: detalle.estado } : d)
        }))
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


