import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import React from 'react';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePedidosStore } from '../../../../store/usePedidosStore';
import DetalleFList from '../../../../presentation/pedido/components/detalles/DetalleFList';
import { Colors } from '../../../../constants/theme';
import { getPedidoStatusColor, getPedidoStatusLabel } from '../../../../presentation/pedido/utils/status-colors';

const PedidoDetalleScreen = () => {
  const { id } = useLocalSearchParams();
  const { pedidos, isLoading } = usePedidosStore();

  const pedido = pedidos.find((p) => p.id === Number(id));

  if (!pedido) {
    return (
      <SafeAreaView className="flex-1 bg-superficie justify-center items-center p-5">
        <Ionicons name="alert-circle-outline" size={64} color="gray" />
        <Text className="font-titulo text-lg text-principal mt-4">Pedido no encontrado</Text>
        <Pressable 
          className="mt-6 px-6 py-3 bg-primary rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-titulo">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusColor = getPedidoStatusColor(pedido.estado);

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      {/* Custom Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-borde">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </Pressable>
        <View>
          <Text className="font-titulo text-xl text-principal">Pedido #{pedido.id}</Text>
          <Text className="font-cuerpo text-xs text-secundario">Mesa {pedido.mesaId}</Text>
        </View>
        <View className="flex-1" />
        <View 
          className="px-3 py-1 rounded-full" 
          style={{ backgroundColor: statusColor + '18' }}
        >
          <Text className="font-titulo text-xs" style={{ color: statusColor }}>
            {getPedidoStatusLabel(pedido.estado)}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Información del pedido */}
        <View className="p-5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-titulo text-lg text-principal">Productos</Text>
            <Text className="font-cuerpo text-sm text-secundario">
              {pedido.detalles?.length || 0} items
            </Text>
          </View>

          {/* Lista de detalles */}
          {pedido.detalles && pedido.detalles.length > 0 ? (
            <DetalleFList detalles={pedido.detalles} />
          ) : (
            <View className="items-center py-10 opacity-40">
              <Ionicons name="restaurant-outline" size={48} color="gray" />
              <Text className="font-cuerpo text-sm text-secundario mt-2">No hay productos en este pedido</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón Finalizar Pedido */}
      {pedido.detalles && pedido.detalles.length > 0 && pedido.detalles.every(d => d.estado === 'SERVIDO') && (
        <View className="p-5 border-t border-borde bg-superficie">
          <Pressable 
            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
            onPress={() => console.log('pedido finalizado')}
          >
            <Ionicons name="checkmark-done-circle" size={22} color="white" />
            <Text className="text-white font-titulo text-base ml-2">Finalizar pedido</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};


export default PedidoDetalleScreen;
