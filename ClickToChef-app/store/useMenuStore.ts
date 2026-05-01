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
  addCategoria: (id: number, nombre: string) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  categorias: [],
  isLoading: false,

  setMenu: (categorias) => set({ categorias, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),

  addCategoria: (id, nombre) => set((state) => ({
    categorias: [...state.categorias, { id, nombre, productos: [] }]
  })),

  // Cambiar disponibilidad de un producto
  setProductoDisponible: (productoId, disponible) => set((state) => ({
    //Recorrer las categorías del menu
    categorias: state.categorias.map(cat => ({
      ...cat,
      //Recorrer los productos de cada categoría
      productos: cat.productos.map(p =>
        //Si el producto es el que se busca, cambiar su disponibilidad
        p.id === productoId ? { ...p, disponible } : p
      )
    }))
  })),
}));
