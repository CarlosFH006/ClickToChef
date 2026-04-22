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
}

export const usePedidosStore = create<PedidosState>((set) => ({
  pedidos: [],
  isLoading: false,

  setPedidos: (pedidos) => set({ pedidos, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateDetallePedido: (detalle) => {
    set((state) => {
      const pedidoAfectado = state.pedidos.find(p => p.id === detalle.pedidoId);

      if (detalle.estado === 'LISTO' && pedidoAfectado) {
        Alert.alert(
          "Plato listo para servir",
          `${detalle.nombreProducto} del pedido #${detalle.pedidoId} listo para servir.`
        );
      }

      return {
        pedidos: state.pedidos.map(p => {
          if (p.id !== detalle.pedidoId) return p;

          const exists = p.detalles.some(d => d.id === detalle.id);
          return {
            ...p,
            detalles: exists
              ? p.detalles.map(d => d.id === detalle.id ? detalle : d)
              : [...p.detalles, detalle]
          };
        })
      };
    });
  },
}));


