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
    default:          return '#94a3b8';
  }
};

export const getPedidoStatusIcon = (estado: Pedidos['estado']) => {
  switch (estado) {
    case 'ABIERTA':   return 'restaurant-outline';
    case 'CERRADA':   return 'checkmark-circle-outline';
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
    default:          return estado;
  }
};

export const getDetalleStatusColor = (estado: string): string => {
  switch (estado) {
    case 'PENDIENTE': return '#94a3b8';
    case 'EN_COCINA': return '#fbbf24';
    case 'LISTO':     return '#4ade80';
    case 'SERVIDO':   return '#3b82f6';
    default:          return '#94a3b8';
  }
};

export const getDetalleStatusIcon = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'time-outline';
    case 'EN_COCINA': return 'flame-outline';
    case 'LISTO':     return 'restaurant-outline';
    case 'SERVIDO':   return 'checkmark-done-outline';
    default:          return 'help-circle-outline';
  }
};

export const getDetalleStatusLabel = (estado: string): string => {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'EN_COCINA': return 'En Cocina';
    case 'LISTO':     return 'Listo';
    case 'SERVIDO':   return 'Servido';
    default:          return estado;
  }
};

