import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMenuStore } from '../../../../store/menu-store'
import { getMenuAction } from '../../../../core/actions/get-menu-action'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import CategoriaFList from '../../../../presentation/pedido/productos/CategoriaFList'

const ProductosIndex = () => {
  const { categorias, isLoading } = useMenuStore();
  const primary = useThemeColor({}, 'primary');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
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
    </SafeAreaView>
  )
}

export default ProductosIndex