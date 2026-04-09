import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../presentation/auth/store/useAuthStore'
import { useThemeColor } from '../../presentation/theme/hooks/use-theme-color'
import LogOutIconButton from '../../presentation/auth/components/LogOutIconButton'

const CheckAuthenticationLayout = () => {
  
    const { status,checkStatus } = useAuthStore()

    const backgroundColor = useThemeColor({}, 'background');
    
    useEffect(() => {
      checkStatus();
    }, [])
    
    if (status === 'checking') {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                <ActivityIndicator />
            </SafeAreaView>
        );
    }

    if (status === 'unauthenticated') {
        // TODO: Guardar la ruta del usuario desde la que accede para redirigirle después de loguearse
        return <Redirect href="/auth/login" />;
    }

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: {
                backgroundColor: backgroundColor
            },
            contentStyle: {
                backgroundColor: backgroundColor
            }
        }}>
            <Stack.Screen name="(home)/index" options={{ 
                title: "Productos", 
                headerLeft: () => <LogOutIconButton/>
            }} />
        </Stack>
    )
}

export default CheckAuthenticationLayout