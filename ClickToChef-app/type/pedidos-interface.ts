export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  notasEspeciales: string;
  estado: 'PENDIENTE' | 'EN_COCINA' | 'LISTO' | 'SERVIDO';
  horaPedido: string;
}

export interface Pedidos {
  id: number;
  mesaId: number;
  usuarioId: number;
  fechaCreacion: string;
  estado: 'ABIERTA' | 'CERRADA';
  detalles: DetallePedido[];
}