export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  productos: Producto[];
}