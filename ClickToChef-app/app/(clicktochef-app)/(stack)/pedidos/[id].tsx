import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, router, Stack, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePedidosStore } from '../../../../store/usePedidosStore';
import { useMenuStore } from '../../../../store/useMenuStore';
import DetalleFList from '../../../../presentation/pedido/components/detalles/DetalleFList';
import CerrarPedidoModal from '../../../../presentation/pedido/components/pedidos/CerrarPedidoModal';
import { Colors } from '../../../../constants/theme';
import { getPedidoStatusColor, getPedidoStatusLabel } from '../../../../presentation/pedido/helpers/status-colors';
import { cancelarPedidoAction } from '../../../../core/actions/cancelar-pedido-action';

const PedidoDetalleScreen = () => {
  const { id } = useLocalSearchParams();
  const { pedidos } = usePedidosStore();
  const { categorias } = useMenuStore();
  const [modalVisible, setModalVisible] = useState(false);
  //Use ref para evitar que se pulse dos veces el boton de añadir productos
  const navegando = useRef(false);
  const navigation = useNavigation();

  const pedido = pedidos.find((p) => p.id === Number(id));

  const productos = categorias.flatMap(c => c.productos);
  const getPrecio = (productoId: number) => {
    const precio = productos.find(p => p.id === productoId)?.precio ?? 0;
    return precio;
  }
  //Recorre todos los detalles del pedido y reduce almacena en acc el precio de cada detalle
  const total = pedido?.detalles?.reduce((acc, d) => acc + getPrecio(d.productoId) * d.cantidad, 0) ?? 0;

  useEffect(() => {
    if (pedido) {
      navigation.setOptions({ title: `Pedido #${pedido.id}` });
    }
  }, [navigation, pedido]);

  if (!pedido) {
    return (
      <SafeAreaView className="flex-1 bg-superficie justify-center items-center p-5">
        <Ionicons name="alert-circle-outline" size={64} color="gray" />
        <Text className="font-titulo text-lg text-principal mt-4">Pedido no encontrado</Text>
        <Pressable
          className="mt-6 px-6 py-3 bg-primary rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-titulo">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusColor = getPedidoStatusColor(pedido.estado);
  const puedeCancelar = pedido.estado === 'ABIERTA' &&
    (pedido.detalles?.length === 0 || pedido.detalles?.every(d => d.estado === 'PENDIENTE'));

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={[]}>

      {/* Subheader fijo */}
      <View className="flex-row justify-between items-center px-5 py-3 border-b border-borde">
        <Text className="font-titulo text-base text-principal">Productos</Text>
        <Text className="font-cuerpo text-sm text-secundario">
          {pedido.detalles?.length || 0} items
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {pedido.detalles && pedido.detalles.length > 0 ? (
            <DetalleFList detalles={pedido.detalles} pedidoAbierto={pedido.estado === 'ABIERTA'} />
          ) : (
            <View className="items-center py-10 opacity-40">
              <Ionicons name="restaurant-outline" size={48} color="gray" />
              <Text className="font-cuerpo text-sm text-secundario mt-2">No hay productos en este pedido</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botones inferiores */}
      {pedido.estado === 'ABIERTA' && (
        <View className="px-5 py-4 border-t border-borde bg-superficie flex-row gap-3">
          <Pressable
            className="flex-1 border border-primary py-3 rounded-2xl flex-row items-center justify-center active:opacity-70"
            onPress={() => {
              if (navegando.current) return;
              navegando.current = true;
              router.push({
                pathname: '/(clicktochef-app)/(stack)/productos',
                params: { mesaId: pedido.mesaId, pedidoId: pedido.id }
              });
              setTimeout(() => { navegando.current = false; }, 1000);
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.light.primary} />
            <Text className="text-primary font-titulo text-sm ml-1.5">Añadir</Text>
          </Pressable>
          {puedeCancelar && (
            <Pressable
              className="flex-1 border border-red-300 py-3 rounded-2xl flex-row items-center justify-center active:opacity-70"
              onPress={() =>
                Alert.alert(
                  'Cancelar pedido',
                  `¿Cancelar el pedido #${pedido.id}? Se restaurará el stock.`,
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelarPedidoAction(pedido.id) },
                  ]
                )
              }
            >
              <Ionicons name="close-circle-outline" size={18} color="#f87171" />
              <Text className="font-titulo text-sm ml-1.5" style={{ color: '#f87171' }}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Botón Finalizar Pedido */}
      {pedido.detalles && pedido.detalles.length > 0 && pedido.detalles.every(d => d.estado === 'SERVIDO') && (
        <View className="px-5 py-4 border-t border-borde bg-superficie">
          <Pressable
            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center active:opacity-90"
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="white" />
            <Text className="text-white font-titulo text-base ml-2">Finalizar pedido</Text>
          </Pressable>
        </View>
      )}

      {/* Modal para cerrar el pedido */}
      <CerrarPedidoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        pedido={pedido}
        getPrecio={getPrecio}
        total={total}
      />

    </SafeAreaView>
  );
};

export default PedidoDetalleScreen;
