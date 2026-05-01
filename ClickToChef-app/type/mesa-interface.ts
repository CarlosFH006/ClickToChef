export type MesaEstado = 'LIBRE' | 'RESERVADA' | 'OCUPADA' | 'RETIRADA';

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: MesaEstado;
}