import { create } from 'zustand';
import { Categoria } from '../type/menu-inetrface';

//Almacenar el estado global del menu
interface MenuState {
  categorias: Categoria[];
  isLoading: boolean;

  // Acciones
  setMenu: (categorias: Categoria[]) => void;
  setLoading: (loading: boolean) => void;
  setProductoDisponible: (productoId: number, disponible: boolean) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  categorias: [],
  isLoading: false,

  setMenu: (categorias) => set({ categorias, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setProductoDisponible: (productoId, disponible) => set((state) => ({
    categorias: state.categorias.map(cat => ({
      ...cat,
      productos: cat.productos.map(p =>
        p.id === productoId ? { ...p, disponible } : p
      )
    }))
  })),
}));
