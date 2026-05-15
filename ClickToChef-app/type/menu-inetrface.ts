export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  activo: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  productos: Producto[];
}