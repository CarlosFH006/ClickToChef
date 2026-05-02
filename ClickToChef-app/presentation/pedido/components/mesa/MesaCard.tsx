import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Mesa } from '../../../../type/mesa-interface';
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action';
import { router } from 'expo-router';
import { useOrderStore } from '../../../../store/useOrderStore';
import { Ionicons } from '@expo/vector-icons';
import { getMesaStatusColor, getMesaStatusLabel } from '../../helpers/status-colors';

interface Props {
  mesa: Mesa;
  pedido?: boolean;
}

const MesaCard = ({ mesa, pedido = false }: Props) => {
  const statusColor = getMesaStatusColor(mesa.estado);
  const isDisabled = pedido && mesa.estado !== 'LIBRE';

  //Usar ref para evitar que se pueda navegar dos veces a la misma mesa
  const navegando = useRef(false);

  return (
    <Pressable
      className="m-2 rounded-2xl flex-1 overflow-hidden bg-superficie shadow-md active:opacity-75"
      style={{ borderColor: statusColor, borderWidth: 1.5, opacity: isDisabled ? 0.45 : 1 }}
      disabled={isDisabled}
      onPress={async () => {
        if (pedido && mesa.estado === 'LIBRE') {
          //Evitar que se pueda navegar dos veces a la misma mesa
          if (navegando.current) return;
          navegando.current = true;
          const success = await updateMesaStatusAction(mesa.id, 'RESERVADA');
          if (success) {
            useOrderStore.getState().setMesa(mesa.id);
            router.push({ pathname: '/(clicktochef-app)/(stack)/productos', params: { mesaId: mesa.id } });
          }
          setTimeout(() => { navegando.current = false; }, 1000);
        }
      }}
    >
      {/* Cuerpo de la tarjeta */}
      <View className="items-center py-5 px-3" style={{ backgroundColor: statusColor + '12' }}>
        <Ionicons name="grid-outline" size={22} color={statusColor} style={{ marginBottom: 6 }} />
        <Text className="font-titulo text-3xl" style={{ color: statusColor }}>
          {mesa.numero}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="people-outline" size={13} color="#71717a" />
          <Text className="font-cuerpo text-xs text-secundario ml-1">{mesa.capacidad}</Text>
        </View>
      </View>

      {/* Franja de estado inferior */}
      <View className="py-1.5 items-center" style={{ backgroundColor: statusColor }}>
        <Text className="font-titulo text-xs text-superficie uppercase tracking-widest">
          {getMesaStatusLabel(mesa.estado)}
        </Text>
      </View>
    </Pressable>
  );
};

export default MesaCard;
