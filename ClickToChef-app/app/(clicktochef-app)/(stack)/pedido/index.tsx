import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'
import { useOrderStore } from '../../../../store/pedido-store'
import { useMenuStore } from '../../../../store/menu-store'
import { getMenuAction } from '../../../../core/actions/get-menu-action'
import { ActivityIndicator, FlatList, Pressable } from 'react-native'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'

const PedidoIndex = () => {
  const { mesaId } = useLocalSearchParams();
  const navigation = useNavigation();

  const { categorias, isLoading } = useMenuStore();
  const addItem = useOrderStore(state => state.addItem);
  const primary = useThemeColor({}, 'primary');

  useEffect(() => {
    getMenuAction();
  }, []);

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
      <View className="px-5 pt-2 pb-4">
        <Text className="font-titulo text-2xl text-gray-800">Pedido - Mesa {mesaId}</Text>
        <Text className="font-cuerpo text-sm text-gray-500">Selecciona los productos para añadir al pedido</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: categoria }) => (
            <View className="mb-6">
              <View className="px-5 py-2 bg-gray-50 border-y border-gray-100">
                <Text className="font-titulo text-lg text-primary uppercase tracking-wider">
                  {categoria.nombre}
                </Text>
              </View>
              
              {categoria.productos.map((producto) => (
                <Pressable 
                  key={producto.id}
                  className="flex-row items-center justify-between px-5 py-4 border-b border-gray-50 active:bg-gray-50"
                  onPress={() => addItem(producto)}
                >
                  <View className="flex-1">
                    <Text className="font-titulo text-base text-gray-800">{producto.nombre}</Text>
                    <Text className="font-cuerpo text-sm text-gray-500">{producto.precio.toFixed(2)}€</Text>
                  </View>
                  
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: primary + '15' }}
                  >
                    <Ionicons name="add" size={24} color={primary} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

export default PedidoIndex