import React from 'react';
import { FlatList } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { ProductoPedido } from '../../../../type/pedido-interface';
import ProductoCard from './ProductoCard';

type ProductoListItem = Producto | ProductoPedido;

interface Props {
  productos: ProductoListItem[];
  showNotas?: boolean;
}

const ProductoFList = ({ productos, showNotas = false }: Props) => {
  return (
    <FlatList<ProductoListItem>
      data={productos}
      scrollEnabled={false}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductoCard
          producto={item}
          showNotas={showNotas}
        />
      )}
    />
  );
};

export default ProductoFList;
