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

const MenuCard = ({ producto }: Props) => {
  const { addItem, updateQuantity, items } = useOrderStore();
  const primary = useThemeColor({}, 'primary');

  const itemInOrder = items.find(item => item.id === producto.id);
  const cantidad = itemInOrder?.cantidad || 0;

  const handleAdd = () => {
    if (cantidad === 0) {
      addItem(producto);
    } else {
      updateQuantity(producto.id, 1);
    }
  };

  const handleRemove = () => {
    if (cantidad > 0) {
      updateQuantity(producto.id, -1);
    }
  };

  return (
    <View className="border-b border-gray-50">
      <Pressable 
        className="flex-row items-center justify-between px-5 py-4 active:bg-gray-50"
        onPress={handleAdd}
      >
        <View className="flex-1">
          <Text className="font-titulo text-base text-gray-800">
            {producto.nombre}
          </Text>
          <Text className="font-cuerpo text-sm text-gray-500">{producto.precio.toFixed(2)}€</Text>
          {producto.disponible ?
            <Text className="font-cuerpo text-sm text-green-500">Disponible</Text>
            : <Text className="font-cuerpo text-sm text-red-500">No disponible</Text>
          }
        </View>
        
        {cantidad === 0 ? (
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: primary + '15' }}
          >
            <Ionicons name="add" size={24} color={primary} />
          </View>
        ) : (
          <View className="flex-row items-center bg-gray-100 rounded-full p-1">
            <Pressable 
              onPress={handleRemove}
              className="w-8 h-8 rounded-full items-center justify-center bg-white shadow-sm"
            >
              <Ionicons name="remove" size={20} color={primary} />
            </Pressable>
            
            <Text className="font-titulo text-base mx-3 min-w-[20px] text-center">
              {cantidad}
            </Text>
            
            <Pressable 
              onPress={handleAdd}
              className="w-8 h-8 rounded-full items-center justify-center bg-white shadow-sm"
            >
              <Ionicons name="add" size={20} color={primary} />
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default MenuCard;