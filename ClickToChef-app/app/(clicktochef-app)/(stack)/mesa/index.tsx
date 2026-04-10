import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColor } from '../../../../presentation/theme/hooks/use-theme-color'
import { useMesaStore } from '../../../../store/mesa-store'
import { getMesasAction } from '../../../../core/actions/get-mesas-action'
import MesaFList from '../../../../presentation/pedido/mesa/MesaFList'

const MesaIndex = () => {
  const primary = useThemeColor({}, 'primary');
  const { mesas, isLoading } = useMesaStore();

  useEffect(() => {
    getMesasAction();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text className='font-titulo text-2xl text-gray-800 mb-2'>Selecciona una Mesa</Text>
        <Text className='font-cuerpo text-sm text-gray-600 mb-4'>
          Para iniciar el pedido, toca una mesa que esté LIBRE para reservarla.
        </Text>
      </View>

      {isLoading && mesas.length === 0 ? (
        <ActivityIndicator size="large" color={primary} className="mt-10" />
      ) : (
        <MesaFList mesas={mesas} pedido={true} />
      )}
    </SafeAreaView>
  )
}

export default MesaIndex