import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMesaStore } from '../../../../store/useMesaStore'
import { useOrderStore } from '../../../../store/useOrderStore'
import { getMesasAction } from '../../../../core/actions/get-mesas-action'
import MesaFList from '../../../../presentation/pedido/components/mesa/MesaFList'
import { Colors } from '../../../../constants/theme'
import { Ionicons } from '@expo/vector-icons'

const MesaIndex = () => {
  const { mesas, isLoading } = useMesaStore();

  useEffect(() => {
    useOrderStore.getState().clearOrder();
    getMesasAction();
  }, []);

  if(isLoading && mesas.length === 0){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="font-titulo text-2xl text-principal">Seleccionar Mesa</Text>
          <Text className="font-cuerpo text-sm text-secundario mt-0.5">
            Solo las mesas libres están disponibles
          </Text>
        </View>

        
        <MesaFList mesas={mesas} pedido={true} />
        
      </ScrollView>

      {/* Banner informativo inferior */}
      <View className="flex-row items-center justify-center px-5 py-3 bg-primary/[6%] border-t border-primary/20">
        <Ionicons name="information-circle-outline" size={16} color={Colors.light.primary} />
        <Text className="font-cuerpo text-xs text-primary ml-1.5">
          Toca una mesa libre para iniciar el pedido
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MesaIndex;
