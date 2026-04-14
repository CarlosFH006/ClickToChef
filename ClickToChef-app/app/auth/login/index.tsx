import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, View, Text } from 'react-native';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';
import ThemedButton from '../../../presentation/theme/components/ThemedButton';
import ThemedTextInput from '../../../presentation/theme/components/ThemedTextInput';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

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
    if (username.length === 0 || pass.length === 0) {
      Alert.alert('Error', 'Por favor completa ambos campos');
      return;
    }
    const success = await login(username, pass);
    if (!success) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
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
            <View className="w-20 h-20 rounded-3xl bg-primary/[10%] items-center justify-center mb-4">
              <Ionicons name="restaurant" size={40} color={Colors.light.primary} />
            </View>
            <Text className="font-titulo text-3xl text-primary">ClickToChef</Text>
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
