import { MesaEstado } from '../../../type/mesa-interface';
import { Pedidos } from '../../../type/pedidos-interface';

export const getMesaStatusColor = (estado: MesaEstado): string => {
  switch (estado) {
    case 'LIBRE':     return '#4ade80';
    case 'RESERVADA': return '#fbbf24';
    case 'OCUPADA':   return '#f87171';
    default:          return '#94a3b8';
  }
};

export const getPedidoStatusColor = (estado: Pedidos['estado']): string => {
  switch (estado) {
    case 'ABIERTA':   return '#fbbf24';
    case 'CERRADA':   return '#4ade80';
    case 'CANCELADA': return '#f87171';
    default:          return '#94a3b8';
  }
};

export const getPedidoStatusIcon = (estado: Pedidos['estado']) => {
  switch (estado) {
    case 'ABIERTA':   return 'restaurant-outline';
    case 'CERRADA':   return 'checkmark-circle-outline';
    case 'CANCELADA': return 'close-circle-outline';
    default:          return 'help-circle-outline';
  }
};

export const getMesaStatusLabel = (estado: MesaEstado): string => {
  switch (estado) {
    case 'LIBRE':     return 'Libre';
    case 'RESERVADA': return 'Reservada';
    case 'OCUPADA':   return 'Ocupada';
    default:          return estado;
  }
};

export const getPedidoStatusLabel = (estado: Pedidos['estado']): string => {
  switch (estado) {
    case 'ABIERTA':   return 'Abierta';
    case 'CERRADA':   return 'Cerrada';
    case 'CANCELADA': return 'Cancelada';
    default:          return estado;
  }
};
