import { Redirect } from 'expo-router';
import { useAuthStore } from '../presentation/auth/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function AppIndex() {
  const status = useAuthStore((state) => state.status);
  const checkStatus = useAuthStore((state) => state.checkStatus);

  //Comprobar si el usuario esta autenticado, al iniciar la app
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  //Mostrar indicador de carga mientras se comprueba el estado
  if (status === 'checking') {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(clicktochef-app)/mesas" />;
  }

  return <Redirect href="/auth/login" />;
}
