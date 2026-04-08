import TcpSocket from 'react-native-tcp-socket';

class SocketClient {
  constructor() {
    this.client = null;
    this.listeners = [];
  }

  /**
   * Inicia la conexión con el servidor TCP.
   * @param {number} port - El puerto del servidor
   * @param {string} host - La dirección IP del servidor (por defecto '10.0.2.2' para el emulador Android)
   */
  connect(port, host = '10.0.2.2') {
    if (this.client) {
      console.log('[SocketClient] La conexión ya está activa o en proceso.');
      return;
    }

    const options = {
      port: port,
      host: host,
    };

    console.log(`[SocketClient] Conectando a ${host}:${port}...`);

    this.client = TcpSocket.createConnection(options, () => {
      console.log(`[SocketClient] Conectado exitosamente a ${host}:${port}`);
    });

    this.client.on('data', (data) => {
      const message = data.toString();
      // console.log('[SocketClient] Datos recibidos (crudo):', message);

      // Los mensajes del servidor Java usando PrintWriter.println() u otros pueden venir 
      // separados por saltos de línea, así que los separamos y parseamos individualmente.
      const messages = message.split('\n').filter(msg => msg.trim() !== '');
      
      messages.forEach(msg => {
        try {
          const parsedData = JSON.parse(msg);
          this._notifyListeners(parsedData);
        } catch (error) {
          console.error('[SocketClient] Error al parsear JSON recibido:', error, 'Mensaje:', msg);
        }
      });
    });

    this.client.on('error', (error) => {
      console.error('[SocketClient] Error en el socket:', error);
      this.disconnect();
    });

    this.client.on('close', () => {
      console.log('[SocketClient] Conexión cerrada');
      this.client = null;
    });
  }

  /**
   * Envía un objeto JSON al servidor. Añade un '\n' al final para 
   * asegurar su compatibilidad con el BufferedReader de Java.
   * @param {object} data - Objeto JSON con la información a enviar.
   */
  send(data) {
    if (!this.client) {
      console.error('[SocketClient] No se puede enviar datos. El socket no está conectado.');
      return;
    }

    try {
      const jsonString = JSON.stringify(data);
      // El salto de línea es crucial para que Java (BufferedReader) lea la línea completa
      this.client.write(jsonString + '\n');
      console.log('[SocketClient] Enviado:', jsonString);
    } catch (error) {
      console.error('[SocketClient] Error al serializar o enviar el JSON:', error);
    }
  }

  /**
   * Desconecta el cliente del servidor de forma limpia.
   */
  disconnect() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      console.log('[SocketClient] Desconectado del servidor.');
    }
  }

  /**
   * Suscribe un callback a los mensajes entrantes.
   * @param {function} callback - Función que manejará el objeto JSON recibido
   */
  subscribe(callback) {
    if (typeof callback === 'function' && !this.listeners.includes(callback)) {
      this.listeners.push(callback);
    }
  }

  /**
   * Desinscribe un callback previamente suscrito.
   * @param {function} callback - La función que se desea eliminar
   */
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notifica a todos los listeners suscritos sobre un nuevo mensaje.
   * @param {object} data - El objeto JSON parseado
   */
  _notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }
}

// Exportamos una única instancia (Singleton)
const instance = new SocketClient();
export default instance;
