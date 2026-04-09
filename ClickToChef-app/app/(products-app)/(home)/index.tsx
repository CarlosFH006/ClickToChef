import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../../presentation/theme/hooks/use-theme-color';
import { ThemedText } from '../../../presentation/theme/components/themed-text';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';

const ProductsApp = () => {
  const primary = useThemeColor({}, 'primary');
  const { user } = useAuthStore();
  
  return (
    <SafeAreaView style={{paddingHorizontal: 20}}>
      <Text className='font-titulo text-primary'>Bienvenido</Text>
      <Text className='font-cuerpo text-primary'>Bienvenido {user?.username}</Text>
    </SafeAreaView>
  )
}

export default ProductsApp