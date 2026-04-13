import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Categoria } from '../../../../type/menu-inetrface';
import MenuCard from './MenuCard';

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
          <View className="px-5 py-2 bg-gray-50 border-y border-gray-100">
            <Text className="font-titulo text-lg text-primary uppercase tracking-wider">
              {categoria.nombre}
            </Text>
          </View>

          {categoria.productos.map((producto) => (
            <MenuCard key={producto.id} producto={producto} />
          ))}
        </View>
      )}
    />
  );
};

export default CategoriaFList;
