import { create } from 'zustand';
import { Mesa, MesaEstado } from '../type/mesa-interface';

interface MesaState {
  mesas: Mesa[];
  isLoading: boolean;
  
  // Acciones
  setMesas: (mesas: Mesa[]) => void;
  updateMesaStatus: (id: number, nuevoEstado: MesaEstado) => void;
}

export const useMesaStore = create<MesaState>((set) => ({
  mesas: [],
  isLoading: false,

  setMesas: (mesas) => set({ mesas, isLoading: false }),

  updateMesaStatus: (id, nuevoEstado) => set((state) => ({
    mesas: state.mesas.map((m) => 
      m.id === id ? { ...m, estado: nuevoEstado } : m
    ),
  })),
}));