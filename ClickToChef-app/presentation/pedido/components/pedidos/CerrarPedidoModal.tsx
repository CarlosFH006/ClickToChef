import { View, Text, Modal, Image, Pressable, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pedidos } from '../../../../type/pedidos-interface';
import { Colors } from '../../../../constants/theme';
import { cerrarMesaAction } from '../../../../core/actions/cerrar-mesa-action';

//Modal para cerrar el pedido

type MetodoPago = 'EFECTIVO' | 'TARJETA';

interface Props {
  visible: boolean;
  onClose: () => void;
  pedido: Pedidos;
  getPrecio: (productoId: number) => number;
  total: number;
}

const CerrarPedidoModal = ({ visible, onClose, pedido, getPrecio, total }: Props) => {
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);

  //Función para cerrar el pedido
  const handleCerrar = () => {
    if (!metodoPago) return;
    cerrarMesaAction(pedido.id, total, metodoPago);
  };

  //Función para cerrar el modal
  const handleClose = () => {
    setMetodoPago(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-superficie rounded-t-3xl px-5 pt-6 pb-10">

          {/* Cabecera */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-titulo text-xl text-principal">Resumen del pedido</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={24} color="#71717a" />
            </Pressable>
          </View>

          {/* Resumen de productos */}
          <View className="bg-fondo rounded-2xl p-4 mb-4">
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {pedido.detalles?.map(d => (
                <View key={d.id} className="flex-row justify-between items-center py-1.5">
                  <View className="flex-row items-center flex-1">
                    <Text className="font-titulo text-sm text-secundario mr-2">{d.cantidad}x</Text>
                    <Text className="font-cuerpo text-sm text-principal flex-1" numberOfLines={1}>
                      {d.nombreProducto}
                    </Text>
                  </View>
                  <Text className="font-titulo text-sm text-principal ml-3">
                    {(getPrecio(d.productoId) * d.cantidad).toFixed(2)}€
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View className="border-t border-borde mt-3 pt-3 flex-row justify-between">
              <Text className="font-titulo text-base text-principal">Total</Text>
              <Text className="font-titulo text-base text-primary">{total.toFixed(2)}€</Text>
            </View>
          </View>

          {/* Método de pago */}
          <Text className="font-titulo text-sm text-secundario mb-3">Método de pago</Text>
          <View className="flex-row gap-4 mb-6">
            <Pressable
              onPress={() => setMetodoPago('EFECTIVO')}
              className="flex-1 items-center py-4 rounded-2xl border-2"
              style={{ borderColor: metodoPago === 'EFECTIVO' ? Colors.light.primary : '#e4e4e7' }}
            >
              <Image
                source={require('../../../../assets/images/efectivo.png')}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
              <Text
                className="font-titulo text-sm mt-2"
                style={{ color: metodoPago === 'EFECTIVO' ? Colors.light.primary : '#71717a' }}
              >
                Efectivo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMetodoPago('TARJETA')}
              className="flex-1 items-center py-4 rounded-2xl border-2"
              style={{ borderColor: metodoPago === 'TARJETA' ? Colors.light.primary : '#e4e4e7' }}
            >
              <Image
                source={require('../../../../assets/images/tarjeta.png')}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
              <Text
                className="font-titulo text-sm mt-2"
                style={{ color: metodoPago === 'TARJETA' ? Colors.light.primary : '#71717a' }}
              >
                Tarjeta
              </Text>
            </Pressable>
          </View>

          {/* Botón cerrar pedido */}
          <Pressable
            onPress={handleCerrar}
            disabled={metodoPago === null}
            className="py-4 rounded-2xl flex-row items-center justify-center"
            style={{ backgroundColor: metodoPago === null ? '#e4e4e7' : Colors.light.primary }}
          >
            <Ionicons name="receipt-outline" size={20} color="white" />
            <Text className="text-white font-titulo text-base ml-2">Cerrar pedido</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
};

export default CerrarPedidoModal;
