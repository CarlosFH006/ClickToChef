import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Producto } from '../../../../type/menu-inetrface';
import { ProductoPedido } from '../../../../type/pedido-interface';
import { useOrderStore } from '../../../../store/useOrderStore';
import { Ionicons } from '@expo/vector-icons';
import { useProductoActions } from '../../hooks/useProductoActions';
import { Colors } from '../../../../constants/theme';

interface Props {
  producto: Producto | ProductoPedido;
  showNotas?: boolean;
}

const ProductoCard = ({ producto, showNotas = false }: Props) => {
  const { setNotas } = useOrderStore();
  const { handleAdd, handleRemove, cantidad } = useProductoActions(producto);
  const primary = Colors.light.primary;

  //Guardar las notas del producto y si estaban abiertas al volver a entrar
  const notasActuales = 'notas' in producto ? (producto.notas ?? '') : '';
  const [notasOpen, setNotasOpen] = useState(notasActuales.length > 0);

  return (
    <View className="py-4 border-b border-borde">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-titulo text-base text-principal">
            {producto.nombre}
          </Text>
          <Text className="font-cuerpo text-sm text-secundario">
            {(producto.precio * cantidad).toFixed(2)}€
          </Text>
          {showNotas && (
            <Pressable onPress={() => setNotasOpen(v => !v)} className="flex-row items-center mt-1 gap-1">
              <Ionicons name={notasOpen ? 'chatbubble' : 'chatbubble-outline'} size={13} color={primary} />
              <Text className="font-cuerpo text-xs text-primary">
                {notasActuales && !notasOpen ? notasActuales : 'Añadir nota'}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center bg-fondo rounded-xl p-1">
          <Pressable
            onPress={handleRemove}
            className="w-8 h-8 rounded-lg items-center justify-center bg-superficie shadow-sm"
          >
            <Ionicons name="remove" size={18} color={primary} />
          </Pressable>

          <Text className="font-titulo text-base mx-3 min-w-[20px] text-center text-principal">
            {cantidad}
          </Text>

          <Pressable
            onPress={handleAdd}
            className="w-8 h-8 rounded-lg items-center justify-center bg-superficie shadow-sm"
          >
            <Ionicons name="add" size={18} color={primary} />
          </Pressable>
        </View>
      </View>

      {showNotas && notasOpen && (
        <TextInput
          className="mt-2 px-3 py-2 rounded-xl bg-fondo font-cuerpo text-sm text-principal"
          placeholder="Ej: sin cebolla, bien hecho..."
          placeholderTextColor="#71717a"
          value={notasActuales}
          onChangeText={(text) => setNotas(producto.id, text)}
          multiline
        />
      )}
    </View>
  );
};

export default ProductoCard;
