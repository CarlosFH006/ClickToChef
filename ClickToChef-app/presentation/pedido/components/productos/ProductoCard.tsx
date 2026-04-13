import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { ProductoPedido } from '../../../../type/pedido-interface';
import { useOrderStore } from '../../../../store/pedido-store';
import { useThemeColor } from '../../../theme/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  producto: Producto | ProductoPedido;
  cantidad?: number;
}

const ProductoCard = ({ producto, cantidad = 0 }: Props) => {
  const { updateQuantity } = useOrderStore();
  const primary = useThemeColor({}, 'primary');

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
      <View className="flex-1">
        <Text className="font-titulo text-base text-gray-800">
          {producto.nombre}
        </Text>
        <Text className="font-cuerpo text-sm text-gray-500">
          {(producto.precio * cantidad).toFixed(2)}€
        </Text>
      </View>

      <View className="flex-row items-center bg-gray-50 rounded-xl p-1">
        <Pressable
          onPress={() => updateQuantity(producto.id, -1)}
          className="w-8 h-8 rounded-lg items-center justify-center bg-white shadow-sm"
        >
          <Ionicons name="remove" size={18} color={primary} />
        </Pressable>

        <Text className="font-titulo text-base mx-3 min-w-[20px] text-center">
          {cantidad}
        </Text>

        <Pressable
          onPress={() => updateQuantity(producto.id, 1)}
          className="w-8 h-8 rounded-lg items-center justify-center bg-white shadow-sm"
        >
          <Ionicons name="add" size={18} color={primary} />
        </Pressable>
      </View>
    </View>
  );
};

export default ProductoCard;
