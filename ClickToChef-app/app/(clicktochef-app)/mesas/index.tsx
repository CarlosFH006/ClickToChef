import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';
import { useEffect } from 'react';
import { useMesaStore } from '../../../store/useMesaStore';
import { getMesasAction } from '../../../core/actions/get-mesas-action';
import MesaFList from '../../../presentation/pedido/components/mesa/MesaFList';
import { Colors } from '../../../constants/theme';
import LogOutIconButton from '../../../presentation/auth/components/LogOutIconButton';

const MesasScreen = () => {
  const { user } = useAuthStore();
  const { mesas, isLoading } = useMesaStore();

  useEffect(() => {
    getMesasAction();
  }, []);

  //Contar mesas por estado
  const mesasVisibles = mesas.filter(m => m.estado !== 'RETIRADA');
  const estados = {
    libres: mesasVisibles.filter(m => m.estado === 'LIBRE').length,
    reservadas: mesasVisibles.filter(m => m.estado === 'RESERVADA').length,
    ocupadas: mesasVisibles.filter(m => m.estado === 'OCUPADA').length,
  };

  if(isLoading && mesas.length === 0){
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-superficie" edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header compacto */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
          <View>
            <Text className="font-titulo text-xl text-principal">Bienvenido, {user?.username}</Text>
            <Text className="font-cuerpo text-xs text-secundario">Estado actual de las mesas</Text>
          </View>
          <LogOutIconButton />
        </View>

        {/* Estados */}
        <View className="flex-row px-5 mb-4">
          <View className="flex-1 mr-2 items-center py-2.5 rounded-xl" style={{ backgroundColor: '#4ade8018' }}>
            <Text className="font-titulo text-lg text-success">{estados.libres}</Text>
            <Text className="font-cuerpo text-[11px] text-success">Libres</Text>
          </View>
          <View className="flex-1 mr-2 items-center py-2.5 rounded-xl" style={{ backgroundColor: '#fbbf2418' }}>
            <Text className="font-titulo text-lg text-warning">{estados.reservadas}</Text>
            <Text className="font-cuerpo text-[11px] text-warning">Reservadas</Text>
          </View>
          <View className="flex-1 items-center py-2.5 rounded-xl" style={{ backgroundColor: '#f8717118' }}>
            <Text className="font-titulo text-lg text-error">{estados.ocupadas}</Text>
            <Text className="font-cuerpo text-[11px] text-error">Ocupadas</Text>
          </View>
        </View>

        
        <MesaFList mesas={mesasVisibles} />
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default MesasScreen;
