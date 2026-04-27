import { create } from 'zustand';
import { ProductoPedido } from '../type/pedido-interface';

//Store para manejar el estado global del pedido
//En este store se va almacenando el pedido mientras se genera

interface OrderState {
  mesaId: number | null;
  items: ProductoPedido[];

  // Acciones
  setMesa: (id: number | null) => void;
  addItem: (producto: any) => void; // El producto que viene del catálogo
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  setNotas: (id: number, notas: string) => void;
  clearOrder: () => void;
  
  // Selectores (opcional para cálculos rápidos)
  getTotal: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  mesaId: null,
  items: [],

  setMesa: (id) => set({ mesaId: id }),

  addItem: (producto) => set((state) => {
    // Comprobamos si el producto ya está en el carrito
    const existingItem = state.items.find(item => item.id === producto.id);
    
    if (existingItem) {
      // Si ya existe, solo subimos la cantidad
      return {
        items: state.items.map(item => 
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        )
      };
    }
    // Si es nuevo, lo añadimos con cantidad 1
    return { items: [...state.items, { ...producto, cantidad: 1 }] };
  }),

  //Elimina un producto del pedido
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  //Actualiza la cantidad de un producto
  updateQuantity: (id, delta) => set((state) => {
    const newItems = state.items.map(item =>
      item.id === id ? { ...item, cantidad: item.cantidad + delta } : item
    ).filter(item => item.cantidad > 0);

    return { items: newItems };
  }),

  //Añade notas a un producto
  setNotas: (id, notas) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, notas } : item
    )
  })),

  //Limpia el pedido
  clearOrder: () => set({ mesaId: null, items: [] }),

  //Calcula el total del pedido
  getTotal: () => {
    return get().items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }
}));