import { View, Text, Button, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import SocketClient from '../core/socket/SocketClient'

const index = () => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Definimos el callback para manejar los mensajes recibidos del servidor
    const handleMessage = (data: any) => {
      setLastMessage(JSON.stringify(data, null, 2));
    };

    // Nos suscribimos a los eventos del socket
    SocketClient.subscribe(handleMessage);

    return () => {
      // Limpiamos la suscripción y desconectamos al desmontar el componente (opcional)
      SocketClient.unsubscribe(handleMessage);
      SocketClient.disconnect();
    };
  }, []);

  const handleConnect = () => {
    // Puerto de prueba, ajusta este número si tu ServerSocket de Java escucha en un puerto distinto
    SocketClient.connect(5000);
    setIsConnected(true);
  };

  const handleSendTest = () => {
    // Enviamos un objeto JSON de prueba siguiendo la estructura que necesite tu servidor
    SocketClient.send({
      action: 'TEST',
      message: '¡Hola servidor, soy la App React Native!',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba TCP Socket</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Conectar a 10.0.2.2:5000" 
          onPress={handleConnect} 
          disabled={isConnected} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Enviar JSON de Prueba" 
          onPress={handleSendTest} 
          disabled={!isConnected} 
        />
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.subtitle}>Último Mensaje Recibido:</Text>
        <Text style={styles.messageText}>
          {lastMessage ? lastMessage : 'Esperando mensajes...'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  messageBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 150,
  },
  messageText: {
    fontFamily: 'monospace',
    color: '#333',
  }
});

export default index