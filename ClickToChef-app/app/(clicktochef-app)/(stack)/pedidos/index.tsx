import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePedidosStore } from '../../../../store/usePedidosStore'
import { useAuthStore } from '../../../../presentation/auth/store/useAuthStore'
import { getPedidosUsuarioAction } from '../../../../core/actions/get-pedidos-usuario-action'
import { getMenuAction } from '../../../../core/actions/get-menu-action'
import PedidoFList from '../../../../presentation/pedido/components/pedidos/PedidoFList'
import { Colors } from '../../../../constants/theme'

const PedidosScreen = () => {
  const { pedidos, isLoading } = usePedidosStore();
  const { user } = useAuthStore();

  //Cargar menu y pedidos del usuario
  useEffect(() => {
    if (user?.id) {
      getMenuAction();
      getPedidosUsuarioAction(user.id);
    }
  }, [user]);

  const activosCount = pedidos.filter(p => p.estado === 'ABIERTA').length;

  if(isLoading && pedidos.length === 0){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View>
            <Text className="font-titulo text-xl text-principal">Mis Pedidos</Text>
            {activosCount > 0 && (
              <Text className="font-cuerpo text-xs text-secundario">
                {activosCount} activo{activosCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Nuevo pedido */}
        <View className="px-5 mb-4">
          <Pressable
            className="flex-row items-center justify-center py-4 rounded-2xl bg-primary active:opacity-90"
            onPress={() => router.push('/(clicktochef-app)/(stack)/mesa')}
          >
            <Ionicons name="add-circle-outline" size={22} color="white" />
            <Text className="font-titulo text-base text-superficie ml-2">Nuevo Pedido</Text>
          </Pressable>
        </View>

        {/* Lista de pedidos */}
        <View className="px-5">
          {pedidos.length === 0 && !isLoading ? (
            <View className="items-center py-16 opacity-40">
              <Ionicons name="receipt-outline" size={72} color="gray" />
              <Text className="font-titulo text-base text-secundario mt-3">Sin pedidos</Text>
              <Text className="font-cuerpo text-sm text-secundario text-center mt-1">
                Crea un nuevo pedido para empezar
              </Text>
            </View>
          ) : (
            <PedidoFList
              pedidos={pedidos}
              onPedidoPress={(p) => router.push(`/(clicktochef-app)/(stack)/pedidos/${p.id}`)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PedidosScreen;
