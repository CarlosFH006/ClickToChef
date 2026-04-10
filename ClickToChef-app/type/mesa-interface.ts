export type MesaEstado = 'LIBRE' | 'RESERVADA' | 'OCUPADA';

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: MesaEstado;
}