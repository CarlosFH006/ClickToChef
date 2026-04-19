import { create } from 'zustand';
import { Mesa, MesaEstado } from '../type/mesa-interface';

//Almacenar el estado global de las mesas
interface MesaState {
  mesas: Mesa[];
  isLoading: boolean;
  
  // Acciones
  setMesas: (mesas: Mesa[]) => void;
  setLoading: (loading: boolean) => void;
  updateMesaStatus: (id: number, nuevoEstado: MesaEstado) => void;
}

export const useMesaStore = create<MesaState>((set) => ({
  mesas: [],
  isLoading: false,

  setMesas: (mesas) => set({ mesas, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
  
  //Cambiar el estado de una mesa especifica
  updateMesaStatus: (id, nuevoEstado) => set((state) => ({
    mesas: state.mesas.map((m) => 
      m.id === id ? { ...m, estado: nuevoEstado } : m
    ),
  })),
}));