import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { Ionicons } from '@expo/vector-icons';
import { useProductoActions } from '../../hooks/useProductoActions';
import { Colors } from '../../../../constants/theme';

interface Props {
  producto: Producto;
}

const MenuCard = ({ producto }: Props) => {
  const { handleAdd, handleRemove, disponible, cantidad } = useProductoActions(producto);
  const primary = Colors.light.primary;

  return (
    <View className="border-b border-borde">
      <View className={`flex-row items-center justify-between px-5 py-5 ${!disponible ? 'opacity-60' : ''}`}>
        <View className="flex-1">
          <Text className="font-titulo text-base text-principal">{producto.nombre}</Text>
          <Text className="font-cuerpo text-sm text-secundario">{producto.precio.toFixed(2)}€</Text>
          <View className="flex-row items-center mt-0.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: disponible ? '#22c55e' : '#ef4444' }} />
            <Text className={`font-cuerpo text-xs ml-1 ${disponible ? 'text-success' : 'text-error'}`}>
              {disponible ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>

        {cantidad === 0 ? (
          <Pressable
            onPress={handleAdd}
            disabled={!disponible}
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
            style={{ backgroundColor: disponible ? primary + '15' : '#f3f4f6' }}
          >
            <Ionicons name="add" size={24} color={disponible ? primary : '#9ca3af'} />
          </Pressable>
        ) : (
          <View className="flex-row items-center bg-fondo rounded-full p-1">
            <Pressable
              onPress={handleRemove}
              className="w-8 h-8 rounded-full items-center justify-center bg-superficie shadow-sm"
            >
              <Ionicons name="remove" size={20} color={primary} />
            </Pressable>

            <Text className="font-titulo text-base mx-3 min-w-[20px] text-center text-principal">
              {cantidad}
            </Text>

            <Pressable
              onPress={handleAdd}
              disabled={!disponible}
              className={`w-8 h-8 rounded-full items-center justify-center bg-superficie shadow-sm ${!disponible ? 'opacity-40' : ''}`}
            >
              <Ionicons name="add" size={20} color={disponible ? primary : '#9ca3af'} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default MenuCard;
