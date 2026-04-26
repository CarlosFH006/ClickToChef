import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pedidos } from '../../../../type/pedidos-interface';
import { Ionicons } from '@expo/vector-icons';
import { getPedidoStatusColor, getPedidoStatusIcon, getPedidoStatusLabel } from '../../utils/status-colors';
import { parseGsonDate } from '../../utils/parse-date';
import { Colors } from '../../../../constants/theme';

interface Props {
  pedido: Pedidos;
  onPress?: (pedido: Pedidos) => void;
}

const PedidoCard = ({ pedido, onPress }: Props) => {
  const statusColor = getPedidoStatusColor(pedido.estado);

  //Convertir la fecha del pedido a un formato legible
  const date = parseGsonDate(pedido.fechaCreacion);
  const dateStr = date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
    : '--';
  const timeStr = date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '--:--';

  return (
    <Pressable
      className="mb-3 rounded-2xl bg-superficie border-l-[6px] shadow-sm active:opacity-80 overflow-hidden"
      style={{ borderColor: statusColor }}
      onPress={() => onPress?.(pedido)}
    >
      <View className="p-4">
        {/* Fila principal: mesa + estado */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: statusColor + '18' }}>
              <Ionicons name="receipt-outline" size={20} color={statusColor} />
            </View>
            <View>
              <Text className="font-titulo text-base text-principal">Mesa {pedido.mesaId}</Text>
              <Text className="font-cuerpo text-xs text-secundario">#{pedido.id}</Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: statusColor + '18' }}>
            <Ionicons name={getPedidoStatusIcon(pedido.estado) as any} size={13} color={statusColor} />
            <Text className="font-titulo text-xs ml-1" style={{ color: statusColor }}>
              {getPedidoStatusLabel(pedido.estado)}
            </Text>
          </View>
        </View>

        {/* Fila inferior: fecha/hora */}
        <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-borde">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={12} color="#71717a" />
            <Text className="font-cuerpo text-xs text-secundario ml-1">{dateStr} · {timeStr}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
        </View>
      </View>
    </Pressable>
  );
};

export default PedidoCard;
