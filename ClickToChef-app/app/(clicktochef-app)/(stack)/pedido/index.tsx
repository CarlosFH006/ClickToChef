import { View, Text, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useOrderStore } from '../../../../store/useOrderStore'
import ProductoFList from '../../../../presentation/pedido/components/productos/ProductoFList'
import useFinalizarPedido from '../../../../presentation/pedido/hooks/useFinalizarPedido'
import useInsertarDetalles from '../../../../presentation/pedido/hooks/useInsertarDetalles'

const PedidoIndex = () => {
  const { items, getTotal, mesaId } = useOrderStore();
  const { finalizarPedido } = useFinalizarPedido();
  const { insertarDetalles } = useInsertarDetalles();
  //Detectar si recibe un id de pedido para saber si se esta añadiendo a un pedido o se esta creando uno nuevo
  const { pedidoId } = useLocalSearchParams();
  const esAdicion = !!pedidoId;

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['top']}>

      {/* Header fijo */}
      <View className="px-5 pt-4 pb-4 border-b border-borde">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-titulo text-2xl text-principal">Resumen</Text>
            {mesaId != null && (
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="grid-outline" size={12} color="#71717a" />
                <Text className="font-cuerpo text-xs text-secundario ml-1">Mesa {mesaId}</Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => router.back()}
            className="bg-fondo px-3 py-1.5 rounded-lg border border-borde"
          >
            <Text className="font-cuerpo text-xs text-primary">+ Añadir más</Text>
          </Pressable>
        </View>
      </View>

      {/* Lista scrollable */}
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center opacity-50 mt-20">
            <Ionicons name="cart-outline" size={64} color="gray" />
            <Text className="font-cuerpo text-secundario mt-2">No hay productos añadidos</Text>
          </View>
        ) : (
          <ProductoFList productos={items} showNotas />
        )}
      </ScrollView>

      {/* Total y botón fijos */}
      {items.length > 0 && (
        <View className="px-5 py-6 border-t border-borde bg-superficie shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-cuerpo text-secundario text-lg">Total del pedido</Text>
            <Text className="font-titulo text-2xl text-primary">{getTotal().toFixed(2)}€</Text>
          </View>
          <Pressable
            className="w-full py-4 rounded-2xl items-center justify-center bg-primary active:opacity-90"
            onPress={async () => {
              if (esAdicion) {
                const success = await insertarDetalles(Number(pedidoId));
                if (success) router.dismiss(2);
              } else {
                const success = await finalizarPedido();
                if (success) router.dismissAll();
              }
            }}
          >
            <Text className="font-titulo text-superficie text-lg">
              {esAdicion ? 'Añadir a pedido' : 'Confirmar Pedido'}
            </Text>
          </Pressable>
        </View>
      )}

    </SafeAreaView>
  )
}

export default PedidoIndex
