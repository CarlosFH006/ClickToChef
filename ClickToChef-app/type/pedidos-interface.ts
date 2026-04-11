export interface Pedidos {
  id: number;
  mesaId: number;
  usuarioId: number;
  fechaCreacion: string;
  estado: 'pendiente' | 'preparando' | 'completado' | 'cancelado';
}