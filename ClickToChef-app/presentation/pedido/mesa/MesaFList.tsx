import React from 'react';
import { FlatList } from 'react-native';
import { Mesa } from '../../../type/mesa-interface';
import MesaCard from './MesaCard';

interface Props {
  mesas: Mesa[];
  pedido?: boolean;
}

const MesaFList = ({ mesas, pedido=false }: Props) => {
  return (
    <FlatList
      data={mesas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MesaCard mesa={item} pedido={pedido} />}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default MesaFList;
