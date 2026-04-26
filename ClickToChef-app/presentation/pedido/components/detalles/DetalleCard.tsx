import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { DetallePedido } from '../../../../type/pedidos-interface';
import { Ionicons } from '@expo/vector-icons';
import { getDetalleStatusColor, getDetalleStatusIcon, getDetalleStatusLabel } from '../../utils/status-colors';
import { parseGsonDate } from '../../utils/parse-date';
import { updateEstadoDetalleAction } from '../../../../core/actions/update-estado-detalle-action';
import { eliminarDetalleAction } from '../../../../core/actions/eliminar-detalle-action';

interface Props {
  detalle: DetallePedido;
  pedidoAbierto?: boolean;
}

const DetalleCard = ({ detalle, pedidoAbierto = false }: Props) => {
  const statusColor = getDetalleStatusColor(detalle.estado);
  
  //Convertir la hora del pedido a un formato legible
  const date = parseGsonDate(detalle.horaPedido);
  const timeStr = date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '--:--';

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

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: statusColor + '18' }}>
              <Ionicons name={getDetalleStatusIcon(detalle.estado) as any} size={13} color={statusColor} />
              <Text className="font-titulo text-xs ml-1" style={{ color: statusColor }}>
                {getDetalleStatusLabel(detalle.estado)}
              </Text>
            </View>
            {pedidoAbierto && detalle.estado === 'PENDIENTE' && (
              <Pressable
                className="w-7 h-7 rounded-full items-center justify-center active:opacity-70"
                style={{ backgroundColor: '#fef2f2' }}
                onPress={() =>
                  Alert.alert(
                    'Eliminar plato',
                    `¿Eliminar ${detalle.nombreProducto} del pedido?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarDetalleAction(detalle.id) },
                    ]
                  )
                }
              >
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
              </Pressable>
            )}
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
