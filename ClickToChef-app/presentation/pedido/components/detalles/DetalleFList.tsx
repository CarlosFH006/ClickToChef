import React from 'react';
import { FlatList } from 'react-native';
import { DetallePedido } from '../../../../type/pedidos-interface';
import DetalleCard from './DetalleCard';

interface Props {
  detalles: DetallePedido[];
}

const DetalleFList = ({ detalles }: Props) => {
  return (
    <FlatList
      data={detalles}
      scrollEnabled={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <DetalleCard
          detalle={item}
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

export default DetalleFList;
