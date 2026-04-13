import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../../presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';
import { useEffect } from 'react';
import { useMesaStore } from '../../../store/mesa-store';
import { getMesasAction } from '../../../core/actions/get-mesas-action';
import MesaFList from '../../../presentation/pedido/components/mesa/MesaFList';

const ProductsApp = () => {
  const primary = useThemeColor({}, 'primary');
  const { user } = useAuthStore();
  const { mesas, isLoading } = useMesaStore();

  useEffect(() => {
    getMesasAction();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text className='font-titulo text-3xl text-primary'>Bienvenido</Text>
          <Text className='font-cuerpo text-lg text-gray-600 mb-6'>Hola, {user?.username}</Text>

          <Text className="font-titulo text-xl text-gray-800 mb-4">Estado de las Mesas</Text>
        </View>

        {isLoading && mesas.length === 0 ? (
          <ActivityIndicator size="large" color={primary} className="mt-10" />
        ) : (
          <MesaFList mesas={mesas} />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProductsApp