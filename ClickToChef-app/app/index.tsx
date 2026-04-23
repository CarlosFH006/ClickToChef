import { Redirect } from 'expo-router';
import { useAuthStore } from '../presentation/auth/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function AppIndex() {
  const status = useAuthStore((state) => state.status);
  const checkStatus = useAuthStore((state) => state.checkStatus);

  //Comprobar si el usuario esta autenticado
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  //Mostrar indicador de carga mientras se comprueba el estado
  //Si el estado es checking, mostrar indicador de carga
  if (status === 'checking') {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  //Si el estado es autenticado, redirigir al usuario a la pantalla de mesas
  if (status === 'authenticated') {
    return <Redirect href="/(clicktochef-app)/mesas" />;
  }

  //Si el estado es no autenticado, redirigir al usuario a la pantalla de login
  return <Redirect href="/auth/login" />;
}
