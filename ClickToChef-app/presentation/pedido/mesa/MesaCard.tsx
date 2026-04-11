import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Mesa, MesaEstado } from '../../../type/mesa-interface';
import { updateMesaStatusAction } from '../../../core/actions/update-mesa-status-action';
import { router } from 'expo-router';
import { useOrderStore } from '../../../store/pedido-store';


interface Props {
  mesa: Mesa;
  pedido?: boolean;
}

const getStatusColor = (estado: MesaEstado) => {
  switch (estado) {
    case 'LIBRE': return '#4ade80'; // verde
    case 'RESERVADA': return '#fbbf24'; // ambar/amarillo
    case 'OCUPADA': return '#f87171'; // rojo
    default: return '#94a3b8'; // gris
  }
};

const MesaCard = ({ mesa, pedido=false }: Props) => {
  return (
    <Pressable 
      className="m-2 p-4 rounded-2xl flex-1 items-center justify-center border-b-4"
      style={{ 
        backgroundColor: '#fff', 
        borderColor: getStatusColor(mesa.estado),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      onPress={async () => {
        if (pedido && mesa.estado === 'LIBRE') {
          const success = await updateMesaStatusAction(mesa.id, 'RESERVADA');
          if (success) {
            useOrderStore.getState().setMesa(mesa.id);
            router.push({ pathname: '/(clicktochef-app)/(stack)/productos', params: { mesaId: mesa.id } });
          }
        }
      }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: getStatusColor(mesa.estado) + '20' }}
      >
        <Text style={{ color: getStatusColor(mesa.estado), fontSize: 20, fontWeight: 'bold' }}>
          {mesa.numero}
        </Text>
      </View>
      
      <Text className="font-titulo text-sm text-gray-800">Mesa {mesa.numero}</Text>
      <Text className="font-cuerpo text-xs text-gray-500">Capacidad: {mesa.capacidad}</Text>
      
      <View 
        className="mt-2 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: getStatusColor(mesa.estado) }}
      >
        <Text className="text-white text-[10px] font-bold">{mesa.estado}</Text>
      </View>
    </Pressable>
  );
};

export default MesaCard;
