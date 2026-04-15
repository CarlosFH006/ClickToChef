import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMenuStore } from '../../../../store/useMenuStore'
import { getMenuAction } from '../../../../core/actions/get-menu-action'
import CategoriaFList from '../../../../presentation/pedido/components/productos/CategoriaFList'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useOrderStore } from '../../../../store/useOrderStore'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'
import { liberarReservaAction } from '../../../../core/actions/liberar-reserva-action'
import { Colors } from '../../../../constants/theme'

const ProductosIndex = () => {
  const { categorias, isLoading } = useMenuStore();
  const { items, getTotal } = useOrderStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { mesaId } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const actionType = e.data.action.type;
      console.log('Navegación detectada al salir:', actionType);

      if ((actionType === 'GO_BACK' || actionType === 'POP') && mesaId) {
        const currentItems = useOrderStore.getState().items;
        currentItems.forEach(item => {
          liberarReservaAction(item.id, item.cantidad);
        });
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

  const filteredCategorias = selectedCategoryId === null
    ? categorias
    : categorias.filter(cat => cat.id === selectedCategoryId);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  if(isLoading){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-3 pb-1">
          <View className="flex-row items-center">
            <Text className="font-titulo text-2xl text-principal">Mesa {mesaId}</Text>
            <View className="bg-primary/[8%] px-2.5 py-0.5 rounded-full ml-2">
              <Text className="font-cuerpo text-xs text-primary">Catálogo</Text>
            </View>
          </View>
          <Text className="font-cuerpo text-sm text-secundario mt-0.5">
            Añade los productos del pedido
          </Text>
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
                className={`mr-3 px-4 py-2 rounded-full border ${selectedCategoryId === item.id
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-borde'
                  }`}
              >
                <Text className={`font-titulo text-sm ${selectedCategoryId === item.id ? 'text-superficie' : 'text-secundario'
                  }`}>
                  {item.nombre}
                </Text>
              </Pressable>
            )}
          />
        </View>

        
        <View className="flex-1">
          <CategoriaFList categorias={filteredCategorias} />
        </View>
        

        {/* Botón Resumen Pedido */}
        {!isLoading && items.length > 0 && (
          <View className="px-5 py-4 bg-superficie border-t border-borde shadow-lg">
            <Pressable
              onPress={() => router.push('/(clicktochef-app)/(stack)/pedido')}
              className="flex-row items-center justify-between p-4 rounded-2xl bg-primary active:opacity-90"
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center mr-3">
                  <Text className="text-superficie font-titulo">{totalItems}</Text>
                </View>
                <Text className="text-superficie font-titulo text-lg">Resumen Pedido</Text>
              </View>
              <Text className="text-superficie font-titulo text-lg">{getTotal().toFixed(2)}€</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProductosIndex
