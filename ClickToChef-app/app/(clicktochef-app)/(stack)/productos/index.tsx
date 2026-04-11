import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMenuStore } from '../../../../store/menu-store'
import { getMenuAction } from '../../../../core/actions/get-menu-action'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import CategoriaFList from '../../../../presentation/pedido/productos/CategoriaFList'

import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useOrderStore } from '../../../../store/pedido-store'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'

const ProductosIndex = () => {
  const { categorias, isLoading } = useMenuStore();
  const { items, getTotal } = useOrderStore();
  const primary = useThemeColor({}, 'primary');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { mesaId } = useLocalSearchParams();
  const navigation = useNavigation();

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

  useEffect(() => {
    getMenuAction();
  }, []);

  useEffect(() => {
    if (categorias.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categorias[0].id);
    }
  }, [categorias]);

  const filteredCategorias = useMemo(() => {
    if (selectedCategoryId === null) return categorias;
    return categorias.filter(cat => cat.id === selectedCategoryId);
  }, [categorias, selectedCategoryId]);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 py-2">
        <Text className="font-titulo text-xl text-gray-800">Catálogo</Text>
      </View>

      {/* Categorías Horizontales */}
      <View className="py-2 mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categorias}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategoryId(item.id)}
              className="mr-3 px-4 py-2 rounded-full border"
              style={{ 
                backgroundColor: selectedCategoryId === item.id ? primary : 'transparent',
                borderColor: selectedCategoryId === item.id ? primary : '#e5e7eb'
              }}
            >
              <Text 
                className="font-titulo text-sm"
                style={{ color: selectedCategoryId === item.id ? 'white' : '#6b7280' }}
              >
                {item.nombre}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <View className="flex-1">
          <CategoriaFList categorias={filteredCategorias} />
        </View>
      )}

      {/* Botón Resumen Pedido */}
      {!isLoading && items.length > 0 && (
        <View className="px-5 py-4 bg-white border-t border-gray-100 shadow-lg">
          <Pressable 
            onPress={() => router.push('/(clicktochef-app)/(stack)/pedido')}
            className="flex-row items-center justify-between p-4 rounded-2xl active:opacity-90"
            style={{ backgroundColor: primary }}
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center mr-3">
                <Text className="text-white font-titulo">{totalItems}</Text>
              </View>
              <Text className="text-white font-titulo text-lg">Resumen Pedido</Text>
            </View>
            <Text className="text-white font-titulo text-lg">{getTotal().toFixed(2)}€</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}

export default ProductosIndex