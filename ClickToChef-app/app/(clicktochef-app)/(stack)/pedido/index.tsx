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
  const { mesaId } = useLocalSearchParams();
  const navigation = useNavigation();

  const { items } = useOrderStore();
  const primary = useThemeColor({}, 'primary');

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Si volvimos atrás (cancelando el pedido con la flecha o gesto), liberamos la mesa
      const actionType = e.data.action.type;
      console.log('Navegación detectada al salir:', actionType);

      if ((actionType === 'GO_BACK' || actionType === 'POP') && mesaId) {
        updateMesaStatusAction(Number(mesaId), 'LIBRE');
        useOrderStore.getState().clearOrder();
      }
    });

    return unsubscribe;
  }, [navigation, mesaId]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="px-5 pb-4">
        <Pressable 
          className="flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed"
          style={{ borderColor: primary, backgroundColor: primary + '05' }}
          onPress={() => router.push('/(clicktochef-app)/(stack)/productos')}
        >
          <Ionicons name="add-circle-outline" size={28} color={primary} />
          <Text className="font-titulo text-lg ml-2" style={{ color: primary }}>Añadir productos</Text>
        </Pressable>
      </View>

      <View className="flex-1 px-5">
        <Text className="font-titulo text-lg text-gray-800 mb-4">Resumen del Pedido</Text>
        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center opacity-50">
            <Ionicons name="cart-outline" size={64} color="gray" />
            <Text className="font-cuerpo text-gray-500 mt-2">No hay productos añadidos</Text>
          </View>
        ) : (
          <ProductoFList productos={items} />
        )}
      </View>
    </SafeAreaView>
  )
}

export default PedidoIndex