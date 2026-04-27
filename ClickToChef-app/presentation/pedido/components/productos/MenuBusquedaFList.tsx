import React from 'react';
import { View, Text } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import MenuCard from './MenuCard';

//Lista de productos filtrados por búsqueda

interface Props {
  productos: Producto[];
  busqueda: string;
}

const MenuBusquedaFList = ({ productos, busqueda }: Props) => {
  if (productos.length === 0) {
    return (
      <View className="items-center py-16 opacity-40">
        <Text className="font-cuerpo text-sm text-secundario">Sin resultados para "{busqueda}"</Text>
      </View>
    );
  }

  return (
    <View>
      {productos.map(producto => (
        <MenuCard key={producto.id} producto={producto} />
      ))}
    </View>
  );
};

export default MenuBusquedaFList;
