import { View, Text, ScrollView, Pressable } from 'react-native';
import React, { useState, useRef } from 'react';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePedidosStore } from '../../../../store/usePedidosStore';
import { useMenuStore } from '../../../../store/useMenuStore';
import DetalleFList from '../../../../presentation/pedido/components/detalles/DetalleFList';
import CerrarPedidoModal from '../../../../presentation/pedido/components/pedidos/CerrarPedidoModal';
import { Colors } from '../../../../constants/theme';
import { getPedidoStatusColor, getPedidoStatusLabel } from '../../../../presentation/pedido/utils/status-colors';

const PedidoDetalleScreen = () => {
  const { id } = useLocalSearchParams();
  const { pedidos } = usePedidosStore();
  const { categorias } = useMenuStore();
  const [modalVisible, setModalVisible] = useState(false);
  //Use ref para evitar que se pulse dos veces el boton de añadir productos
  const navegando = useRef(false);

  const pedido = pedidos.find((p) => p.id === Number(id));

  const productos = categorias.flatMap(c => c.productos);
  const getPrecio = (productoId: number) =>{
    const precio = productos.find(p => p.id === productoId)?.precio ?? 0;
    return precio;
  }
  //Recorre todos los detalles del pedido y reduce almacena en acc el precio de cada detalle
  const total = pedido?.detalles?.reduce((acc, d) => acc + getPrecio(d.productoId) * d.cantidad, 0) ?? 0;

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
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-borde">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </Pressable>
        <View>
          <Text className="font-titulo text-xl text-principal">Pedido #{pedido.id}</Text>
          <Text className="font-cuerpo text-xs text-secundario">Mesa {pedido.mesaId}</Text>
        </View>
        <View className="flex-1" />
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + '18' }}>
          <Text className="font-titulo text-xs" style={{ color: statusColor }}>
            {getPedidoStatusLabel(pedido.estado)}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-titulo text-lg text-principal">Productos</Text>
            <Text className="font-cuerpo text-sm text-secundario">
              {pedido.detalles?.length || 0} items
            </Text>
          </View>

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

      {/* Botón Añadir productos */}
      {pedido.estado === 'ABIERTA' && (
        <View className="px-5 pt-5 bg-superficie">
          <Pressable
            className="border border-primary py-3 rounded-2xl flex-row items-center justify-center active:opacity-70"
            onPress={() => {
              if (navegando.current) return;
              navegando.current = true;
              router.push({
                pathname: '/(clicktochef-app)/(stack)/productos',
                params: { mesaId: pedido.mesaId, pedidoId: pedido.id }
              });
              setTimeout(() => { navegando.current = false; }, 1000);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
            <Text className="text-primary font-titulo text-base ml-2">Añadir productos</Text>
          </Pressable>
        </View>
      )}

      {/* Botón Finalizar Pedido */}
      {pedido.detalles && pedido.detalles.length > 0 && pedido.detalles.every(d => d.estado === 'SERVIDO') && (
        <View className="p-5 border-t border-borde bg-superficie">
          <Pressable
            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="checkmark-done-circle" size={22} color="white" />
            <Text className="text-white font-titulo text-base ml-2">Finalizar pedido</Text>
          </Pressable>
        </View>
      )}

      {/* Modal para cerrar el pedido */}
      <CerrarPedidoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        pedido={pedido}
        getPrecio={getPrecio}
        total={total}
      />

    </SafeAreaView>
  );
};

export default PedidoDetalleScreen;
