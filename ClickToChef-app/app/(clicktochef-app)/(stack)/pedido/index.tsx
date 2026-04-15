import { View, Text, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useOrderStore } from '../../../../store/pedido-store'
import ProductoFList from '../../../../presentation/pedido/components/productos/ProductoFList'
import useFinalizarPedido from '../../../../presentation/pedido/hooks/useFinalizarPedido'

const PedidoIndex = () => {
  const { items, getTotal, mesaId } = useOrderStore();
  const { finalizarPedido } = useFinalizarPedido();

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pt-4">
          <View className="flex-row items-center justify-between mb-6">
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

          {items.length === 0 ? (
            <View className="flex-1 justify-center items-center opacity-50">
              <Ionicons name="cart-outline" size={64} color="gray" />
              <Text className="font-cuerpo text-secundario mt-2">No hay productos añadidos</Text>
            </View>
          ) : (
            <ProductoFList productos={items} showNotas />
          )}
        </View>

        {items.length > 0 && (
          <View className="px-5 py-6 border-t border-borde bg-superficie shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-cuerpo text-secundario text-lg">Total del pedido</Text>
              <Text className="font-titulo text-2xl text-primary">{getTotal().toFixed(2)}€</Text>
            </View>

            <Pressable
              className="w-full py-4 rounded-2xl items-center justify-center bg-primary active:opacity-90"
              onPress={async () => {
                const success = await finalizarPedido();
                if (success) {
                  router.dismissAll();
                }
              }}
            >
              <Text className="font-titulo text-superficie text-lg">Confirmar Pedido</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default PedidoIndex
