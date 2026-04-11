import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'
import { useOrderStore } from '../../../../store/pedido-store'
import { ActivityIndicator, Pressable } from 'react-native'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import ProductoFList from '../../../../presentation/pedido/productos/ProductoFList'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const PedidoIndex = () => {

  const { items, getTotal } = useOrderStore();
  const primary = useThemeColor({}, 'primary');

 

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-titulo text-2xl text-gray-800">Resumen del Pedido</Text>
          <Pressable 
            onPress={() => router.push('/(clicktochef-app)/(stack)/productos')}
            className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
          >
            <Text className="font-cuerpo text-xs text-primary">+ Añadir más</Text>
          </Pressable>
        </View>

        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center opacity-50">
            <Ionicons name="cart-outline" size={64} color="gray" />
            <Text className="font-cuerpo text-gray-500 mt-2">No hay productos añadidos</Text>
          </View>
        ) : (
          <ProductoFList productos={items} />
        )}
      </View>

      {/* Resumen del Total */}
      {items.length > 0 && (
        <View className="px-5 py-6 border-t border-gray-100 bg-white shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-cuerpo text-gray-500 text-lg">Total del pedido</Text>
            <Text className="font-titulo text-2xl" style={{ color: primary }}>{getTotal().toFixed(2)}€</Text>
          </View>
          
          <Pressable 
            className="w-full py-4 rounded-2xl items-center justify-center"
            style={{ backgroundColor: primary }}
            onPress={() => console.log('Confirmar pedido')}
          >
            <Text className="font-titulo text-white text-lg">Confirmar Pedido</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PedidoIndex