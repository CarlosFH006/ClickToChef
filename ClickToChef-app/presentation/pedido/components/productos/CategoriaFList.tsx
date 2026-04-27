import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Categoria } from '../../../../type/menu-inetrface';
import MenuFList from './MenuFList';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  categorias: Categoria[];
}

const CategoriaFList = ({ categorias }: Props) => {
  return (
    <FlatList
      data={categorias}
      scrollEnabled={false}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: categoria }) => (
        <View className="mb-6">
          <View className="px-5 py-3 bg-fondo border-y border-borde flex-row items-center">
            <Ionicons name="restaurant-outline" size={14} color="#71717a" />
            <Text className="font-titulo text-sm text-secundario uppercase tracking-widest ml-2" numberOfLines={1}>
              {categoria.nombre}
            </Text>
          </View>

          <MenuFList productos={categoria.productos} />
        </View>
      )}
    />
  );
};

export default CategoriaFList;
