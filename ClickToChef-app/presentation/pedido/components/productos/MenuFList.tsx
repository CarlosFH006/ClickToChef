import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import MenuCard from './MenuCard';

interface Props {
  productos: Producto[];
  busqueda?: string;
}

const MenuFList = ({ productos, busqueda }: Props) => {
  if (productos.length === 0 && busqueda) {
    return (
      <View className="items-center py-16 opacity-40">
        <Text className="font-cuerpo text-sm text-secundario">Sin resultados para "{busqueda}"</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={productos}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <MenuCard producto={item} />}
    />
  );
};

export default MenuFList;