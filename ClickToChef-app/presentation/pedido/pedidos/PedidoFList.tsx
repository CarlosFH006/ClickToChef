import React from 'react';
import { FlatList } from 'react-native';
import { Pedidos } from '../../../type/pedidos-interface';
import PedidoCard from './PedidoCard';

interface Props {
  pedidos: Pedidos[];
  onPedidoPress?: (pedido: Pedidos) => void;
}

const PedidoFList = ({ pedidos, onPedidoPress }: Props) => {
  return (
    <FlatList
      data={pedidos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PedidoCard 
          pedido={item} 
          onPress={onPedidoPress} 
        />
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
