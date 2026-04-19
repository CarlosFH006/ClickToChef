import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, View, Text, Image } from 'react-native';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';
import ThemedButton from '../../../presentation/theme/components/ThemedButton';
import ThemedTextInput from '../../../presentation/theme/components/ThemedTextInput';

const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(clicktochef-app)/mesas');
    }
  }, [status]);

  const [form, setForm] = useState({ username: '', pass: '' });

  const onLogin = async () => {
    const { username, pass } = form;
    if (username.trim().length === 0 || pass.trim().length === 0) {
      Alert.alert('Error', 'Por favor completa ambos campos');
      return;
    }

    login(username, pass);
    //Si en 5 segundos no se ha autenticado, mostrar error de conexión
    setTimeout(() => {
      if (useAuthStore.getState().status === 'checking') {
        useAuthStore.setState({ status: 'unauthenticated' });
        Alert.alert('Sin conexión', 'No se pudo conectar con el servidor. Comprueba la red e inténtalo de nuevo.');
      }
    }, 5000);
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-fondo">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require('../../../assets/images/logo-clicktochef.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text className="font-titulo text-3xl text-primary mt-4">ClickToChef</Text>
            <Text className="font-cuerpo text-base text-secundario mt-1">Panel del Camarero</Text>
          </View>

          {/* Formulario */}
          <View>
            <ThemedTextInput
              placeholder="Nombre de usuario"
              autoCapitalize="none"
              icon="person-outline"
              value={form.username}
              onChangeText={(value) => setForm({ ...form, username: value })}
            />

            <ThemedTextInput
              placeholder="Contraseña"
              secureTextEntry
              autoCapitalize="none"
              icon="lock-closed-outline"
              value={form.pass}
              onChangeText={(value) => setForm({ ...form, pass: value })}
            />

            <View className="mt-2" />

            <ThemedButton
              icon="log-in-outline"
              variant="primary"
              onPress={onLogin}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? 'Cargando...' : 'Entrar'}
            </ThemedButton>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
