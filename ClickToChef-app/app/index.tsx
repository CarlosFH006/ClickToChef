import { Redirect } from 'expo-router';
import { useAuthStore } from '../presentation/auth/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function AppIndex() {
  const status = useAuthStore((state) => state.status);
  const checkStatus = useAuthStore((state) => state.checkStatus);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

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

  // Si no está autenticado, redirige al login
  return <Redirect href="/auth/login" />;
}
