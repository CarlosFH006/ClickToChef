import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Producto } from '../../../type/menu-inetrface';
import { useOrderStore } from '../../../store/pedido-store';
import { useThemeColor } from '../../theme/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Props {
  producto: Producto;
  cantidad?: number;
}

const ProductoCard = ({ producto,cantidad }: Props) => {
  const addItem = useOrderStore(state => state.addItem);
  const primary = useThemeColor({}, 'primary');

  return (
    <Pressable 
      className="flex-row items-center justify-between px-5 py-4 border-b border-gray-50 active:bg-gray-50"
    >
      <View className="flex-1">
        <Text className="font-titulo text-base text-gray-800">
          {cantidad && <Text style={{ color: primary }}>{cantidad}x </Text>}
          {producto.nombre}
        </Text>
        <Text className="font-cuerpo text-sm text-gray-500">{producto.precio.toFixed(2)}€</Text>
      </View>
      
      <View 
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: primary + '15' }}
      >
        <Ionicons name="add" size={24} color={primary} />
      </View>
    </Pressable>
  );
};

export default ProductoCard;
