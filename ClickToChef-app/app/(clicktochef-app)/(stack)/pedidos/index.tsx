import { View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import { usePedidosStore } from '../../../../store/pedidos-store'
import { useAuthStore } from '../../../../presentation/auth/store/useAuthStore'
import { getPedidosUsuarioAction } from '../../../../core/actions/get-pedidos-usuario-action'
import PedidoFList from '../../../../presentation/pedido/pedidos/PedidoFList'

const PedidosScreen = () => {
  const primary = useThemeColor({}, 'primary');
  const { pedidos, isLoading } = usePedidosStore();
  const { user } = useAuthStore();

  const fetchPedidos = useCallback(() => {
    if (user?.id) {
      getPedidosUsuarioAction(user.id);
    }
  }, [user]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-4">
        <Pressable 
          className="flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed shadow-sm"
          style={{ borderColor: primary, backgroundColor: primary + '05' }}
          onPress={() => router.push('/(clicktochef-app)/(stack)/mesa')}
        >
          <Ionicons name="add-circle-outline" size={28} color={primary} />
          <Text className="font-titulo text-lg ml-2" style={{ color: primary }}>Nuevo Pedido</Text>
        </Pressable>
      </View>
      
      <View className="flex-1 px-5 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-titulo text-xl text-gray-800">Tus Pedidos</Text>
          {isLoading && <ActivityIndicator color={primary} size="small" />}
        </View>

        {pedidos.length === 0 && !isLoading ? (
          <View className="flex-1 justify-center items-center opacity-30">
            <Ionicons name="receipt-outline" size={80} color="gray" />
            <Text className="font-cuerpo text-gray-500 mt-4 text-center">
              No tienes pedidos asignados{"\n"}en este momento.
            </Text>
          </View>
        ) : (
          <PedidoFList 
            pedidos={pedidos} 
            onPedidoPress={(p) => console.log('Pedido seleccionado:', p.id)}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default PedidosScreen