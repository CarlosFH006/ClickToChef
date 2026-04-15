  import { create } from 'zustand';
import { Pedidos } from '../type/pedidos-interface';

interface PedidosState {
  pedidos: Pedidos[];
  isLoading: boolean;
  
  // Acciones
  setPedidos: (pedidos: Pedidos[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePedidosStore = create<PedidosState>((set) => ({
  pedidos: [],
  isLoading: false,

  setPedidos: (pedidos) => set({ pedidos, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
