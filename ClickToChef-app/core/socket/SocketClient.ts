import { Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { useMesaStore } from '../../store/useMesaStore';
import { useMenuStore } from '../../store/useMenuStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useOrderStore } from '../../store/useOrderStore';

// Interfaces para definir la estructura de los mensajes
interface ServerMessage {
  type: string;
  payload?: any;
  status?: 'success' | 'error';
}

interface ClientMessage {
  type: string;
  payload?: any;
}

class SocketClient {
  private client: TcpSocket.Socket | null = null;
  private readonly host: string = process.env.EXPO_PUBLIC_SERVER_HOST || 'localhost';
  private readonly port: number = Number(process.env.EXPO_PUBLIC_SERVER_PORT) || 5000;

  constructor() {
    this.client = null;
  }

  public connect(): void {
    if (this.client) return;

    console.log(`[Socket] Conectando a ${this.host}:${this.port}...`);

    this.client = TcpSocket.createConnection({
      port: this.port,
      host: this.host
    }, () => {
      console.log(`[Socket] Conectado a ${this.host}:${this.port}`);
    });

    this.client.on('data', (data: Buffer | string) => {
      const messages = data.toString().split('\n').filter(Boolean);

      messages.forEach(msg => {
        try {
          const parsedData: ServerMessage = JSON.parse(msg);
          this.handleServerMessage(parsedData);
        } catch (error) {
          console.error('[Socket] Error JSON:', error, msg);
        }
      });
    });

    this.client.on('error', (error: Error) => {
      console.error('[Socket] Error:', error);
      this.disconnect();
    });

    this.client.on('close', () => {
      console.log('[Socket] Conexión cerrada');
      this.client = null;
    });
  }

  private handleServerMessage(data: ServerMessage): void {
    console.log('[Socket] Recibido:', data.type);

    // Tipamos el require para mantener la seguridad
    const { useAuthStore } = require('../../presentation/auth/store/useAuthStore');

    switch (data.type) {
      case 'LOGIN_RESPONSE':
        const { success, user } = data.payload || {};

        if (success) {
          if (user.rol === 'CAMARERO') {
            useAuthStore.getState().changeStatus(user);
          } else {
            useAuthStore.getState().changeStatus();
            Alert.alert("Acceso denegado", "Debe ser Camarero para acceder a esta aplicación.");
          }
        } else {
          useAuthStore.getState().changeStatus();
          Alert.alert("Error", "Usuario o contraseña incorrectos");
        }
        break;

      case 'MESAS_RESPONSE':
        if (data.payload?.mesas) {
          console.log('[Socket] Mesas recibidas:', data.payload.mesas.length);
          useMesaStore.getState().setMesas(data.payload.mesas);
        }
        break;

      case 'MESA_UPDATED':
        if (data.payload) {
          const { id, estado } = data.payload;
          console.log(`[Socket] Mesa ${id} actualizada a ${estado}`);
          useMesaStore.getState().updateMesaStatus(id, estado);
        }
        break;

      case 'MENU_RESPONSE':
      case 'MENU_UPDATED':
        if (data.payload) {
          useMenuStore.getState().setMenu(data.payload);
        }
        break;

      case 'PEDIDOS_USUARIO_RESPONSE':
      case 'PEDIDOS_UPDATED':
        if (data.payload) {
          const { user } = useAuthStore.getState();
          if (user) {
            const filtered = (data.payload as any[]).filter(p => p.usuarioId === user.id);
            console.log(`[Socket] ${data.type} recibidos:`, filtered.length);
            usePedidosStore.getState().setPedidos(filtered);
          }
        }
        break;

      case 'CREAR_PEDIDO_RESPONSE':
        const { success: orderSuccess, pedidoId } = data.payload;
        if (orderSuccess) {
          console.log(`[Socket] Pedido ${pedidoId} creado con éxito.`);
          Alert.alert("Pedido Confirmado", `El pedido #${pedidoId} ha sido enviado a cocina.`);
        } else {
          Alert.alert("Error", "No se pudo crear el pedido en el servidor.");
        }
        break;

      case 'RESERVAR_PRODUCTO_RESPONSE':
      case 'LIBERAR_RESERVA_RESPONSE':
      case 'FINALIZAR_RESERVA_RESPONSE':
        if (data.payload) {
          const { success, productoId, cantidad } = data.payload;
          console.log(`[Socket] ${data.type}: success=${success}, productoId=${productoId}, cantidad=${cantidad}`);

          if (!success && data.type === 'RESERVAR_PRODUCTO_RESPONSE') {
            console.warn(`[Socket] Reserva fallida para producto ${productoId}. Marcando como no disponible.`);
            useOrderStore.getState().updateQuantity(productoId, -(cantidad || 1));
            Alert.alert("Stock insuficiente", "No hay suficiente stock para reservar la cantidad solicitada.");
          }
        }
        break;

      default:
        console.warn('[Socket] Tipo de mensaje no manejado:', data.type);
    }
  }

  public send(data: ClientMessage): void {
    if (!this.client) {
      console.warn('[Socket] No conectado. Intentando reconectar...');
      this.connect();

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

  public disconnect(): void {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      console.log('[Socket] Desconectado manualmente.');
    }
  }
}

const socketClient = new SocketClient();
export default socketClient;