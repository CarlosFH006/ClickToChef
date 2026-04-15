export interface Pedidos {
  id: number;
  mesaId: number;
  usuarioId: number;
  fechaCreacion: string;
  estado: 'ABIERTA' | 'CERRADA' | 'CANCELADA';
}