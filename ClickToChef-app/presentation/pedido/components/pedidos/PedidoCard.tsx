import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pedidos } from '../../../../type/pedidos-interface';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../../theme/hooks/use-theme-color';

interface Props {
  pedido: Pedidos;
  onPress?: (pedido: Pedidos) => void;
}

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'pendiente': return '#94a3b8'; // gris
    case 'preparando': return '#fbbf24'; // ambar/amarillo
    case 'completado': return '#4ade80'; // verde
    case 'cancelado': return '#f87171'; // rojo
    default: return '#94a3b8';
  }
};

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'pendiente': return 'time-outline';
    case 'preparando': return 'restaurant-outline';
    case 'completado': return 'checkmark-circle-outline';
    case 'cancelado': return 'close-circle-outline';
    default: return 'help-circle-outline';
  }
};

const PedidoCard = ({ pedido, onPress }: Props) => {
  const primary = useThemeColor({}, 'primary');
  const dateStr = new Date(pedido.fechaCreacion).toLocaleString();

  return (
    <Pressable
      className="m-2 p-4 rounded-2xl bg-white border-l-8"
      style={{
        borderColor: getStatusColor(pedido.estado),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
      onPress={() => onPress?.(pedido)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: primary + '15' }}
          >
            <Ionicons name="receipt-outline" size={20} color={primary} />
          </View>
          <View>
            <Text className="font-titulo text-base text-gray-800">Mesa {pedido.mesaId}</Text>
            <Text className="font-cuerpo text-xs text-gray-500">ID: #{pedido.id}</Text>
          </View>
        </View>

        <View
          className="px-3 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: getStatusColor(pedido.estado) + '15' }}
        >
          <Ionicons name={getStatusIcon(pedido.estado) as any} size={14} color={getStatusColor(pedido.estado)} />
          <Text
            className="text-[10px] font-bold ml-1 uppercase"
            style={{ color: getStatusColor(pedido.estado) }}
          >
            {pedido.estado}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-50 pt-2 flex-row justify-between items-center">
        <Text className="font-cuerpo text-[10px] text-gray-400">
          {dateStr}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </Pressable>
  );
};

export default PedidoCard;
