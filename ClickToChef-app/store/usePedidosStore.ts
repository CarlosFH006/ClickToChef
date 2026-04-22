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
    // Si el plato se marca como LISTO, mostramos una alerta al usuario
    if (detalle.estado === 'LISTO') {
      Alert.alert(
        "Plato listo para servir",
        `${detalle.nombreProducto} del pedido #${detalle.pedidoId} listo para servir.`
      );
    }

    set((state) => ({
      pedidos: state.pedidos.map(p => {
        if (p.id !== detalle.pedidoId) return p;
        
        // Si ya existe el detalle, lo actualizamos; si no, lo añadimos
        const exists = p.detalles.some(d => d.id === detalle.id);
        return {
          ...p,
          detalles: exists 
            ? p.detalles.map(d => d.id === detalle.id ? detalle : d)
            : [...p.detalles, detalle]
        };
      })
    }));
  },
}));


