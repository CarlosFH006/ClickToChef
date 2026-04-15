import { create } from 'zustand';
import { Categoria } from '../type/menu-inetrface';

interface MenuState {
  categorias: Categoria[];
  isLoading: boolean;

  // Acciones
  setMenu: (categorias: Categoria[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  categorias: [],
  isLoading: false,

  setMenu: (categorias) => set({ categorias, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
