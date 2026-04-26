import React from 'react'
import { Stack } from 'expo-router'
import { useThemeColor } from '../../../presentation/theme/hooks/use-theme-color'

const StackLayout = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: backgroundColor,
      },
      headerTintColor: textColor,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="pedidos/index" options={{ title: 'Pedidos' }} />
      <Stack.Screen name="mesa/index" options={{ title: 'Mesa' }} />
      <Stack.Screen name="productos/index" options={{ title: 'Productos' }} />
      <Stack.Screen name="pedido/index" options={{ title: 'Pedido' }} />
      <Stack.Screen name="pedidos/[id]" options={{title: 'Detalle del pedido'}}/>
    </Stack>
  )
}

export default StackLayout