import { Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { router } from 'expo-router';
import { useMesaStore } from '../../store/useMesaStore';
import { useMenuStore } from '../../store/useMenuStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useOrderStore } from '../../store/useOrderStore';

//Clase Singleton para manejar el Socket

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
  private host: string = process.env.EXPO_PUBLIC_SERVER_HOST!;
  private port: number = Number(process.env.EXPO_PUBLIC_SERVER_PORT);
  //Buffer para manejar datos parciales
  private buffer: string = '';

  //Constructor de la clase
  constructor() {
    this.client = null;
  }

  public connect(): void {
    //Si ya existe una conexión, no crear otra
    if (this.client) return;

    console.log(`[Socket] Conectando a ${this.host}:${this.port}...`);

    //Crear conexión
    this.client = TcpSocket.createConnection({
      port: this.port,
      host: this.host
    }, () => {
      console.log(`[Socket] Conectado a ${this.host}:${this.port}`);
    });

    //El evento data se dispara cuando el servidor envía datos
    this.client.on('data', (data: Buffer | string) => {
      this.buffer += data.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() ?? '';
      lines.forEach((line: string) => {
        if (!line.trim()) return;
        try {
          const parsedData: ServerMessage = JSON.parse(line);
          this.handleServerMessage(parsedData);
        } catch (error) {
          console.error('[Socket] Error JSON:', error, line);
        }
      });
    });

    //Manejar errores
    this.client.on('error', (error: Error) => {
      console.error('[Socket] Error:', error);
      //Desconectar del servidor si ocurre un error
      this.disconnect();
    });

    //Manejar cierre de conexión
    this.client.on('close', () => {
      console.log('[Socket] Conexión cerrada. Reconectando en 3s...');
      this.buffer = '';
      this.client = null;
      //Al perder la conexión, redirigir al inicio, limpiar el pedido e intentar conectar nuevamente
      useOrderStore.getState().clearOrder();
      router.replace('/(clicktochef-app)/mesas');
      Alert.alert('Conexión perdida', 'Se ha perdido la conexión con el servidor. Reconectando...');
      setTimeout(() => this.connect(), 3000);
    });
  }

  //Procesar los mensajes recibidos del servidor
  private handleServerMessage(data: ServerMessage): void {
    console.log('[Socket] Recibido:', data.type);
    /*
      Require dinámico para evitar una dependencia circular
      ya que useAuthStore utiliza login-action que utiliza SocketClient
    */
    const { useAuthStore } = require('../../presentation/auth/store/useAuthStore');
    switch (data.type) {
      case 'LOGIN_RESPONSE':
        const { success, user } = data.payload || {};
        if (success) {
          //Si el usuario es camarero, cambiar estado a autenticado
          if (user.rol === 'CAMARERO') {
            useAuthStore.getState().changeStatus(user);
          } else {
            //Si el usuario no es camarero, cambiar estado a no autenticado
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

      //Actualizar estado de una mesa en tiempo real
      case 'MESA_UPDATED':
        if (data.payload) {
          const { id, estado } = data.payload;
          console.log(`[Socket] Mesa ${id} actualizada a ${estado}`);
          useMesaStore.getState().updateMesaStatus(id, estado);
        }
        break;

      case 'MENU_RESPONSE':
        if (data.payload) {
          useMenuStore.getState().setMenu(data.payload);
        }
        break;

      case 'PEDIDOS_USUARIO_RESPONSE':
        if (data.payload) {
          const { user } = useAuthStore.getState();
          if (user) {
            //Filtrar los pedidos del usuario
            const filtered = (data.payload as any[]).filter(p => p.usuarioId === user.id);
            console.log(`[Socket] PEDIDOS_USUARIO_RESPONSE recibidos:`, filtered.length);
            usePedidosStore.getState().setPedidos(filtered);
          }
        }
        break;

      //Actualizar lista de pedidos
      case 'PEDIDOS_UPDATED':
        if (data.payload) {
          const { user } = useAuthStore.getState();
          const pedido = data.payload;
          if (user && pedido.usuarioId === user.id) {
            //Si el pedido está cerrado o cancelado, eliminarlo de la lista
            if (pedido.estado === 'CERRADA' || pedido.estado === 'CANCELADO') {
              console.log(`[Socket] Pedido ${pedido.id} ${pedido.estado.toLowerCase()}, eliminando de la lista`);
              usePedidosStore.getState().removePedido(pedido.id);
            } else {
              //Si el pedido no está cerrado ni cancelado, añadirlo a la lista
              console.log(`[Socket] Pedido ${pedido.id} actualizado/añadido`);
              usePedidosStore.getState().upsertPedido(pedido);
            }
          }
        }
        break;

      //Actualizar detalle del pedido
      case 'DETALLE_UPDATED':
        if (data.payload) {
          console.log('[Socket] Detalle actualizado:', data.payload.id);
          usePedidosStore.getState().updateDetallePedido(data.payload);
        }
        break;

      //Controlar la respuesta del cambio del estado del plato
      case 'UPDATE_ESTADO_DETALLE_RESPONSE':
        if (data.payload) {
          const { success, id } = data.payload;
          if (!success) {
            Alert.alert("Error", `No se pudo actualizar el estado del plato #${id}`);
          } else {
            console.log(`[Socket] Confirmación: Plato #${id} actualizado correctamente.`);
          }
        }
        break;

      //Controlar la respuesta de la creación del pedido
      case 'CREAR_PEDIDO_RESPONSE':
        const { success: orderSuccess, pedidoId } = data.payload;
        if (orderSuccess) {
          console.log(`[Socket] Pedido ${pedidoId} creado con éxito.`);
          Alert.alert("Pedido Confirmado", `El pedido #${pedidoId} ha sido enviado a cocina.`);
        } else {
          Alert.alert("Error", "No se pudo crear el pedido en el servidor.");
        }
        break;

      //Controlar la respuesta de la inserción de los detalles del pedido
      case 'INSERTAR_DETALLES_RESPONSE':
        if (data.payload?.success) {
          console.log(`[Socket] Detalles añadidos al pedido ${data.payload.pedidoId}`);
          Alert.alert("Productos añadidos", `Los productos han sido enviados a cocina.`);
          router.back();
        } else {
          Alert.alert("Error", "No se pudieron añadir los productos al pedido.");
        }
        break;

      //Controlar la respuesta de la reserva del producto
      case 'RESERVAR_PRODUCTO_RESPONSE':
      //Controlar la respuesta de la liberación de la reserva del producto
      case 'LIBERAR_RESERVA_RESPONSE':
      //Controlar la respuesta de la finalización de la reserva del producto
      case 'FINALIZAR_RESERVA_RESPONSE':
        if (data.payload) {
          const { success, productoId, cantidad } = data.payload;
          console.log(`[Socket] ${data.type}: success=${success}, productoId=${productoId}, cantidad=${cantidad}`);

          //Si la reserva falla, devolver el pedido a la cantidad anterior
          if (!success && data.type === 'RESERVAR_PRODUCTO_RESPONSE') {
            console.warn(`[Socket] Reserva fallida para producto ${productoId}. Marcando como no disponible.`);
            useOrderStore.getState().updateQuantity(productoId, -cantidad);
            useMenuStore.getState().setProductoDisponible(productoId, false);
            Alert.alert("Stock insuficiente", "No hay suficiente stock para reservar la cantidad solicitada.");
          }
        }
        break;

      //Actualizar stock
      case 'STOCK_UPDATED':
        if (data.payload) {
          const noDisponibles: number[] = data.payload;
          const { categorias } = useMenuStore.getState();
          //Filtrar todos los productos que se reciban como no disponibles
          categorias.flatMap(c => c.productos).forEach(p =>
            useMenuStore.getState().setProductoDisponible(p.id, !noDisponibles.includes(p.id))
          );
        }
        break;

      //Mostrar errores del servidor
      case 'SERVER_ERROR':
        Alert.alert('Error del servidor', data.payload?.message ?? 'Error desconocido');
        break;

      //Controlar la respuesta de la cancelación del pedido
      case 'CANCELAR_PEDIDO_RESPONSE':
        if (data.payload?.success) {
          Alert.alert('Pedido cancelado', `El pedido #${data.payload.pedidoId} ha sido cancelado.`);
          router.back();
        } else {
          Alert.alert('No se puede cancelar', 'El pedido tiene platos en preparación, listos o ya servidos.');
        }
        break;

      case 'UPDATE_MESA_STATUS_RESPONSE':
        if (data.payload && !data.payload.success) {
          Alert.alert('Mesa no disponible', 'Esta mesa ya ha sido reservada por otro usuario.');
          router.back();
        }
        break;

      case 'NEW_MESA':
        if (data.payload) {
          const { id, numero, capacidad, estado } = data.payload;
          console.log(`[Socket] Nueva mesa: #${numero} (ID: ${id})`);
          useMesaStore.getState().addMesa({ id, numero, capacidad, estado });
        }
        break;

      case 'MESA_CAPACIDAD_UPDATED':
        if (data.payload) {
          const { id, capacidad } = data.payload;
          console.log(`[Socket] Mesa ${id} capacidad → ${capacidad}`);
          useMesaStore.getState().updateMesaCapacidad(id, capacidad);
        }
        break;

      case 'NEW_CATEGORIA':
        if (data.payload) {
          const { id, nombre } = data.payload;
          console.log(`[Socket] Nueva categoría: ${nombre} (ID: ${id})`);
          useMenuStore.getState().addCategoria(id, nombre);
        }
        break;

      case 'DETALLE_DELETED':
        if (data.payload) {
          console.log('[Socket] Detalle eliminado:', data.payload.id);
          usePedidosStore.getState().removeDetalle(data.payload.id);
        }
        break;

      //Controlar la respuesta de la eliminación del detalle
      case 'ELIMINAR_DETALLE_RESPONSE':
        if (data.payload) {
          const { success, id } = data.payload;
          if (!success) {
            Alert.alert('Error', `No se pudo eliminar el plato #${id}. Solo se pueden eliminar platos pendientes.`);
          } else {
            console.log(`[Socket] Detalle #${id} eliminado.`);
          }
        }
        break;

      //Controlar la respuesta de la finalización de la reserva del producto
      case 'CERRAR_MESA_RESPONSE':
        if (data.payload?.success) {
          Alert.alert('Pedido cerrado', `El pedido #${data.payload.pedidoId} ha sido cerrado correctamente.`);
          router.back();
        } else {
          Alert.alert('Error', 'No se pudo cerrar el pedido. Inténtalo de nuevo.');
        }
        break;

      default:
        console.warn('[Socket] Tipo de mensaje no manejado:', data.type);
    }
  }

  //Enviar mensajes al servidor
  public send(data: ClientMessage): void {
    //Si no hay conexión, intentar reconectar
    if (!this.client) {
      console.warn('[Socket] No conectado. Intentando reconectar...');
      this.connect();

      //Esperamos un segundo para que connect se establezca
      setTimeout(() => {
        //Si se ha establecido la conexión, enviar el mensaje
        if (this.client) {
          try {
            this.client.write(JSON.stringify(data) + '\n');
            console.log('[Socket] Enviado (tras reconexión):', data.type);
          } catch (err) {
            //Si ocurre un error, mostrar alerta
            console.error('[Socket] Error al enviar tras reconexión:', err);
            this.client = null;
            Alert.alert(
              'Sin conexión',
              'No se pudo conectar con el servidor. Comprueba la red e inténtalo de nuevo.'
            );
          }
        //Si no se ha establecido la conexión, mostrar alerta
        } else {
          Alert.alert(
            'Sin conexión',
            'No se pudo conectar con el servidor. Comprueba la red e inténtalo de nuevo.'
          );
        }
      }, 1000);
      return;
    }

    //Si hay conexión, enviar el mensaje
    try {
      this.client.write(JSON.stringify(data) + '\n');
      console.log('[Socket] Enviado:', data.type);
    } catch (err) {
      //Si ocurre un error, mostrar alerta
      console.error('[Socket] Error al enviar:', err);
      this.client = null;
      Alert.alert(
        'Sin conexión',
        'Se perdió la conexión con el servidor. Comprueba la red e inténtalo de nuevo.'
      );
    }
  }

  //Desconectar del servidor
  public disconnect(): void {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      console.log('[Socket] Desconectado manualmente.');
    }
  }
}

//Instancia única de SocketClient
const socketClient = new SocketClient();
export default socketClient;