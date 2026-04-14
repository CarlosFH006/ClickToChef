import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { useThemeColor } from '../../../theme/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useProductoActions } from '../../hooks/useProductoActions';

interface Props {
  producto: Producto;
}

const MenuCard = ({ producto }: Props) => {
  const primary = useThemeColor({}, 'primary');
  const { handleAdd, handleRemove, disponible, cantidad } = useProductoActions(producto);

  return (
    <View className="border-b border-gray-50">
      <Pressable
        className={`flex-row items-center justify-between px-5 py-4 ${disponible ? 'active:bg-gray-50' : 'opacity-60'}`}
        onPress={handleAdd}
        disabled={!disponible}
      >
        <View className="flex-1">
          <Text className="font-titulo text-base text-gray-800">
            {producto.nombre}
          </Text>
          <Text className="font-cuerpo text-sm text-gray-500">{producto.precio.toFixed(2)}€</Text>
          {disponible ?
            <Text className="font-cuerpo text-sm text-green-500">Disponible</Text>
            : <Text className="font-cuerpo text-sm text-red-500">No disponible</Text>
          }
        </View>

        {cantidad === 0 ? (
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: disponible ? primary + '15' : '#f3f4f6' }}
          >
            <Ionicons name="add" size={24} color={disponible ? primary : '#9ca3af'} />
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
              disabled={!disponible}
              className={`w-8 h-8 rounded-full items-center justify-center bg-white shadow-sm ${!disponible ? 'opacity-40' : ''}`}
            >
              <Ionicons name="add" size={20} color={disponible ? primary : '#9ca3af'} />
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default MenuCard;