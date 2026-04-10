import { Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
// Eliminamos la importación estática de useAuthStore para evitar el Require Cycle

class SocketClient {
  constructor() {
    this.client = null;
    this.host = '10.0.2.2'; // IP para el emulador Android por defecto
    this.port = 5000;       // Puerto de tu servidor Java
  }

  connect() {
    if (this.client) return;

    console.log(`[Socket] Conectando a ${this.host}:${this.port}...`);
    this.client = TcpSocket.createConnection({ port: this.port, host: this.host }, () => {
      console.log(`[Socket] Conectado a ${this.host}:${this.port}`);
    });

    this.client.on('data', (data) => {
      // Los mensajes del servidor Java usando PrintWriter vienen separados por \n
      const messages = data.toString().split('\n').filter(Boolean);
      messages.forEach(msg => {
        try {
          const parsedData = JSON.parse(msg);
          this.handleServerMessage(parsedData);
        } catch (error) {
          console.error('[Socket] Error JSON:', error, msg);
        }
      });
    });

    this.client.on('error', (error) => {
      console.error('[Socket] Error:', error);
      this.disconnect();
    });

    this.client.on('close', () => {
      console.log('[Socket] Conexión cerrada');
      this.client = null;
    });
  }

  // Centralizamos aquí las respuestas del servidor para toda la app
  handleServerMessage(data) {
    console.log('[Socket] Recibido:', data.type);

    // Requerimos el store aquí (lazy load) para romper el Require Cycle
    const { useAuthStore } = require('../../presentation/auth/store/useAuthStore');

    switch (data.type) {
      case 'LOGIN_RESPONSE':
        const { success, user } = data.payload || {};

        if (success) {
          // Verificamos si el usuario tiene el rol de camarero
          if (user.rol === 'CAMARERO') {
            useAuthStore.getState().changeStatus(user);
          } else {
            // Si no es camarero, reseteamos el estado y mostramos error de rol
            useAuthStore.getState().changeStatus();
            Alert.alert("Acceso denegado", "Debe ser Camarero para acceder a esta aplicacion.");
          }
        } else {
          useAuthStore.getState().changeStatus();

          Alert.alert("Error", "Usuario o contraseña incorrectos");
        }
        break;
      default:
        console.warn('[Socket] Tipo de mensaje no manejado:', data.type);
    }
  }

  send(data) {
    if (!this.client) {
      // Intentamos autoconectar si el socket estaba caído
      console.warn('[Socket] No conectado. Intentando reconectar...');
      this.connect();
      // Retrasamos el envío para darle 1 seg a la conexión
      setTimeout(() => {
        if (this.client) {
          this.client.write(JSON.stringify(data) + '\n');
          console.log('[Socket] Enviado (tras reconexión):', data.type);
        }
      }, 1000);
      return;
    }

    this.client.write(JSON.stringify(data) + '\n');
    console.log('[Socket] Enviado:', data.type);
  }

  disconnect() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      console.log('[Socket] Desconectado manualmente.');
    }
  }
}

const socketClient = new SocketClient();
export default socketClient;
