import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { ProductoPedido } from '../../../../type/pedido-interface';
import { useOrderStore } from '../../../../store/pedido-store';
import { useThemeColor } from '../../../theme/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useProductoActions } from '../../hooks/useProductoActions';

interface Props {
  producto: Producto | ProductoPedido;
  showNotas?: boolean;
}

const ProductoCard = ({ producto, showNotas = false }: Props) => {
  const { setNotas } = useOrderStore();
  const primary = useThemeColor({}, 'primary');
  const { handleAdd, handleRemove, cantidad } = useProductoActions(producto);

  const notasActuales = 'notas' in producto ? (producto.notas ?? '') : '';
  const [notasOpen, setNotasOpen] = useState(notasActuales.length > 0);

  return (
    <View className="py-4 border-b border-gray-50">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-titulo text-base text-gray-800">
            {producto.nombre}
          </Text>
          <Text className="font-cuerpo text-sm text-gray-500">
            {(producto.precio * cantidad).toFixed(2)}€
          </Text>
          {showNotas && (
            <Pressable onPress={() => setNotasOpen(v => !v)} className="flex-row items-center mt-1 gap-1">
              <Ionicons name={notasOpen ? 'chatbubble' : 'chatbubble-outline'} size={13} color={primary} />
              <Text className="font-cuerpo text-xs" style={{ color: primary }}>
                {notasActuales && !notasOpen ? notasActuales : 'Añadir nota'}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center bg-gray-50 rounded-xl p-1">
          <Pressable
            onPress={handleRemove}
            className="w-8 h-8 rounded-lg items-center justify-center bg-white shadow-sm"
          >
            <Ionicons name="remove" size={18} color={primary} />
          </Pressable>

          <Text className="font-titulo text-base mx-3 min-w-[20px] text-center">
            {cantidad}
          </Text>

          <Pressable
            onPress={handleAdd}
            className="w-8 h-8 rounded-lg items-center justify-center bg-white shadow-sm"
          >
            <Ionicons name="add" size={18} color={primary} />
          </Pressable>
        </View>
      </View>

      {showNotas && notasOpen && (
        <TextInput
          className="mt-2 px-3 py-2 rounded-xl bg-gray-50 font-cuerpo text-sm text-gray-700"
          placeholder="Ej: sin cebolla, bien hecho..."
          placeholderTextColor="#9ca3af"
          value={notasActuales}
          onChangeText={(text) => setNotas(producto.id, text)}
          multiline
        />
      )}
    </View>
  );
};

export default ProductoCard;