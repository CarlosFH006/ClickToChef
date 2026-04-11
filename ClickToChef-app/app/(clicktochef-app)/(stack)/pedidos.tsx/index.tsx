import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'

const PedidosScreen = () => {
  const primary = useThemeColor({}, 'primary');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="px-5 pt-4">
        <Pressable 
          className="flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed"
          style={{ borderColor: primary, backgroundColor: primary + '05' }}
          onPress={() => router.push('/(clicktochef-app)/(stack)/mesa')}
        >
          <Ionicons name="add-circle-outline" size={28} color={primary} />
          <Text className="font-titulo text-lg ml-2" style={{ color: primary }}>Nuevo Pedido</Text>
        </Pressable>
      </View>
      
      <View className="flex-1 px-5 pt-6">
        <Text className="font-titulo text-xl text-gray-800">Tus Pedidos</Text>
        <Text className="font-cuerpo text-gray-500 mt-2">Aquí aparecerán los pedidos realizados</Text>
      </View>
    </SafeAreaView>
  )
}

export default PedidosScreen