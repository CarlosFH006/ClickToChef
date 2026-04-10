import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../../presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';
import { useEffect } from 'react';
import { useMesaStore } from '../../../store/mesa-store';
import { getMesasAction } from '../../../core/actions/get-mesas-action';
import { Mesa, MesaEstado } from '../../../type/mesa-interface';

const ProductsApp = () => {
  const primary = useThemeColor({}, 'primary');
  const { user } = useAuthStore();
  const { mesas, isLoading } = useMesaStore();

  useEffect(() => {
    getMesasAction();
  }, []);

  const getStatusColor = (estado: MesaEstado) => {
    switch (estado) {
      case 'LIBRE': return '#4ade80'; // verde
      case 'RESERVADA': return '#fbbf24'; // ambar/amarillo
      case 'OCUPADA': return '#f87171'; // rojo
      default: return '#94a3b8'; // gris
    }
  };

  const renderMesa = ({ item }: { item: Mesa }) => (
    <View 
      className="m-2 p-4 rounded-2xl flex-1 items-center justify-center border-b-4"
      style={{ 
        backgroundColor: '#fff', 
        borderColor: getStatusColor(item.estado),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: getStatusColor(item.estado) + '20' }}
      >
        <Text style={{ color: getStatusColor(item.estado), fontSize: 20, fontWeight: 'bold' }}>
          {item.numero}
        </Text>
      </View>
      
      <Text className="font-titulo text-sm text-gray-800">Mesa {item.numero}</Text>
      <Text className="font-cuerpo text-xs text-gray-500">Capacidad: {item.capacidad}</Text>
      
      <View 
        className="mt-2 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: getStatusColor(item.estado) }}
      >
        <Text className="text-white text-[10px] font-bold">{item.estado}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text className='font-titulo text-3xl text-primary'>Bienvenido</Text>
        <Text className='font-cuerpo text-lg text-gray-600 mb-6'>Hola, {user?.username}</Text>
        
        <Text className="font-titulo text-xl text-gray-800 mb-4">Estado de las Mesas</Text>
      </View>

      {isLoading && mesas.length === 0 ? (
        <ActivityIndicator size="large" color={primary} className="mt-10" />
      ) : (
        <FlatList
          data={mesas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMesa}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

export default ProductsApp