import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { DetallePedido } from '../../../../type/pedidos-interface';
import { Ionicons } from '@expo/vector-icons';
import { getDetalleStatusColor, getDetalleStatusIcon, getDetalleStatusLabel } from '../../utils/status-colors';
import { updateEstadoDetalleAction } from '../../../../core/actions/update-estado-detalle-action';

interface Props {
  detalle: DetallePedido;
}

const DetalleCard = ({ detalle }: Props) => {
  const statusColor = getDetalleStatusColor(detalle.estado);
  
  //Convertir la hora del pedido a un formato legible
  const date = detalle.horaPedido ? new Date(detalle.horaPedido.replace(' ', 'T')) : null;
  const validDate = date && !isNaN(date.getTime());
  const timeStr = validDate ? date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <View
      className="mb-3 rounded-2xl bg-superficie border-l-[6px] shadow-sm overflow-hidden"
      style={{ borderColor: statusColor }}
    >
      <View className="p-4">
        {/* Fila principal: producto + cantidad */}
        <View className="flex-row justify-between items-start">
          <View className="flex-row flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: statusColor + '18' }}>
              <Text className="font-titulo text-lg" style={{ color: statusColor }}>{detalle.cantidad}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-titulo text-base text-principal" numberOfLines={1}>{detalle.nombreProducto}</Text>
              <Text className="font-cuerpo text-xs text-secundario">Pedido #{detalle.pedidoId}</Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: statusColor + '18' }}>
            <Ionicons name={getDetalleStatusIcon(detalle.estado) as any} size={13} color={statusColor} />
            <Text className="font-titulo text-xs ml-1" style={{ color: statusColor }}>
              {getDetalleStatusLabel(detalle.estado)}
            </Text>
          </View>
        </View>

        {/* Notas si existen */}
        {detalle.notasEspeciales ? (
          <View className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <Text className="font-cuerpo text-xs italic text-secundario">
              "{detalle.notasEspeciales}"
            </Text>
          </View>
        ) : null}

        {/* Fila inferior: hora */}
        <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-borde">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#71717a" />
            <Text className="font-cuerpo text-xs text-secundario ml-1">{timeStr}</Text>
          </View>
        </View>

        {/* Botón Servir si está LISTO */}
        {detalle.estado === 'LISTO' && (
          <Pressable 
            className="mt-4 py-3.5 bg-success rounded-xl flex-row items-center justify-center active:opacity-90"
            onPress={() => updateEstadoDetalleAction(detalle.id, 'SERVIDO')}
          >
            <Ionicons name="restaurant-outline" size={18} color="white" />
            <Text className="font-titulo text-sm text-white ml-2">Servir plato</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};


export default DetalleCard;
