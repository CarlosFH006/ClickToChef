import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import { useAuthStore } from '../../presentation/auth/store/useAuthStore'
import { useThemeColor } from '../../presentation/theme/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'

const CheckAuthenticationLayout = () => {

    const { status } = useAuthStore();
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');

    //Comprobar si el usuario esta autenticado
    if (status === 'checking') {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        )
    }

    if (status === 'unauthenticated') {
        return <Redirect href="/auth/login" />
    }
    
    return (
        <Tabs screenOptions={{
            headerShadowVisible: false,
            headerStyle: {
                backgroundColor: backgroundColor
            },
            tabBarStyle: {
                backgroundColor: backgroundColor,
                borderTopWidth: 0,
                elevation: 0,
            },
            tabBarActiveTintColor: primaryColor,
        }}>
            <Tabs.Screen name="mesas/index" options={{
                title: "Mesas",
                tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={24} color={color} />,
            }} />
            <Tabs.Screen name="(stack)" options={{
                title: "Pedido",
                tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />,
                headerShown: false
            }} />
        </Tabs>
    )
}

export default CheckAuthenticationLayout