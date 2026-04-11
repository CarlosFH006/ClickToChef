import React from 'react';
import { FlatList } from 'react-native';
import { Producto } from '../../../type/menu-inetrface';
import { ProductoPedido } from '../../../type/pedido-interface';
import ProductoCard from './ProductoCard';

interface Props {
  productos: Producto[] | ProductoPedido[];
}

const ProductoFList = ({ productos }: Props) => {
  return (
    <FlatList
      data={productos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductoCard 
          producto={item} 
          cantidad={(item as ProductoPedido).cantidad} 
        />
      )}
    />
  );
};

export default ProductoFList;
