import React from 'react';
import { FlatList } from 'react-native';
import { Producto } from '../../../type/menu-inetrface';
import { ProductoPedido } from '../../../type/pedido-interface';
import ProductoCard from './ProductoCard';

type ProductoListItem = Producto | ProductoPedido;

interface Props {
  productos: ProductoListItem[];
}

const ProductoFList = ({ productos }: Props) => {
  return (
    <FlatList<ProductoListItem>
      data={productos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductoCard 
          producto={item} 
          cantidad={'cantidad' in item ? item.cantidad : 0}
        />
      )}
    />
  );
};

export default ProductoFList;
