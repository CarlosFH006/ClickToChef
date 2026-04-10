import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { updateMesaStatusAction } from '../../../../core/actions/update-mesa-status-action'

const PedidoIndex = () => {
  const { mesaId } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Si volvimos atrás (cancelando el pedido con la flecha o gesto), liberamos la mesa
      const actionType = e.data.action.type;
      console.log('Navegación detectada al salir:', actionType);
      
      if ((actionType === 'GO_BACK' || actionType === 'POP') && mesaId) {
        updateMesaStatusAction(Number(mesaId), 'LIBRE');
      }
    });

    return unsubscribe;
  }, [navigation, mesaId]);

  return (
    <SafeAreaView>
      <View>
        <Text>PedidoIndex - Mesa seleccionada: {mesaId}</Text>
      </View>
    </SafeAreaView>
  )
}

export default PedidoIndex