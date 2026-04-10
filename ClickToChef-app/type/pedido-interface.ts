export interface ProductoPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  mesaId: number | null;
  productos: ProductoPedido[];
  total: number;
}