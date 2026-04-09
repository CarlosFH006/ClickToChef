import { View, KeyboardAvoidingView, ScrollView, useWindowDimensions, Alert } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { ThemedText } from '../../../presentation/theme/components/themed-text';
import ThemedTextInput from '../../../presentation/theme/components/ThemedTextInput';
import ThemedButton from '../../../presentation/theme/components/ThemedButton';
import { useAuthStore } from '../../../presentation/auth/store/useAuthStore';

const LoginScreen = () => {
  const { height } = useWindowDimensions();

  // Traemos las propiedades del store actualizado
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);

  // Cambiamos 'email' por 'username' para coincidir con tu DAO de Java
  const [form, setForm] = useState({ username: '', pass: '' })

  const onLogin = async () => {
    const { username, pass } = form;

    if (username.length === 0 || pass.length === 0) {
      Alert.alert("Error", "Por favor completa ambos campos");
      return;
    }

    // El store ahora maneja el estado 'checking' (isPosting)
    const success = await login(username, pass);

    if (success) {
      // Nota: Con Sockets, la navegación suele hacerse cuando 
      // el status cambia a 'authenticated' via un useEffect,
      // pero por ahora lo dejamos aquí para tu flujo actual.
      router.replace('/');
    } else {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  }

  return (
    <KeyboardAvoidingView behavior='padding' className="flex-1 bg-fondo">
      <ScrollView className="px-10">
        <View style={{ paddingTop: height * 0.35 }}>
          <ThemedText type='title' className="text-principal">ClickToChef</ThemedText>
          <ThemedText className="text-secundario">Inicia sesión para continuar</ThemedText>
        </View>

        <View className="mt-5">
          <ThemedTextInput
            placeholder='Nombre de usuario'
            autoCapitalize='none'
            icon='person-outline' // Icono más acorde a 'username'
            value={form.username}
            onChangeText={(value) => setForm({ ...form, username: value })}
          />

          <ThemedTextInput
            placeholder='Contraseña'
            secureTextEntry
            autoCapitalize='none'
            icon='lock-closed-outline'
            value={form.pass}
            onChangeText={(value) => setForm({ ...form, pass: value })}
          />

          <View className="mt-4" />

          <ThemedButton
            icon='log-in-outline'
            onPress={onLogin}
            // Usamos el status del store para deshabilitar el botón
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Cargando...' : 'Entrar'}
          </ThemedButton>

          <View className="mt-6" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen