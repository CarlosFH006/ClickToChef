import React from 'react';
import { FlatList } from 'react-native';
import { Pedidos } from '../../../../type/pedidos-interface';
import PedidoCard from './PedidoCard';

interface Props {
  pedidos: Pedidos[];
}

const PedidoFList = ({ pedidos }: Props) => {
  return (
    <FlatList
      data={pedidos}
      scrollEnabled={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PedidoCard pedido={item} />
      )}
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 10
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PedidoFList;
