// Módulo singleton que gestiona la conexión WebSocket con el servidor.
// Envuelve el WebSocket nativo del navegador y expone una interfaz limpia
// para conectar, enviar mensajes y reaccionar a cambios de estado.
const WebSocketService = (() => {
    // Instancia del WebSocket nativo. Null hasta que se llama a connect().
    let ws = null;
    // Callback que recibirá los mensajes en bruto del servidor.
    let onMessageCallback = null;
    // Callback que recibirá los cambios de estado de la conexión.
    let onStatusChangeCallback = null;

    // Abre la conexión WebSocket con el servidor.
    // Si la conexión se pierde, se reintenta automáticamente cada 3 segundos.
    function connect() {
        //Cambiar el estado a conectando
        _notifyStatus("connecting");

        //Construir la URL del WebSocket desde config.js
        const url = 'ws://'+CONFIG.WS_IP+':'+CONFIG.WS_PORT
        
        //Crear la conexión WebSocket
        ws = new WebSocket(url);

        // Si la conexión se establece correctamente
        ws.onopen = () => {
            //Cambiar el estado a conectado
            _notifyStatus("connected");
        };

        // Si la conexión se cierra
        // Reintenta la conexión tras 3 segundos formando un bucle de reconexión.
        ws.onclose = () => {
            //Cambiar el estado a desconectado
            _notifyStatus("disconnected");
            //Reconectar despues de 3 segundos
            setTimeout(connect, 3000);
        };

        // Si hay un error en la conexión
        ws.onerror = () => {
            //Cambiar el estado a error
            _notifyStatus("error");
            //Alertar al usuario
            alert("No hay conexión con el servidor")
        };

        // Si se recibe un mensaje del servidor, ejecutar el callback registrado
        ws.onmessage = (event) => {
            if (onMessageCallback) onMessageCallback(event.data);
        };
    }

    // Envía datos al servidor si la conexión está abierta.
    // Acepta string o objeto — si es objeto lo serializa a JSON automáticamente.
    // Devuelve true si el envío fue exitoso, false si la conexión no está disponible.
    function send(data) {
        if (isConnected()) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
            return true;
        }
        return false;
    }

    // Registra el callback que recibirá los mensajes en bruto del servidor.
    // Solo puede haber un suscriptor — el último registrado sobreescribe al anterior.
    function onMessage(callback) {
        onMessageCallback = callback;
    }

    // Registra el callback que recibirá los cambios de estado de la conexión.
    function onStatusChange(callback) {
        onStatusChangeCallback = callback;
    }

    // Devuelve true si el WebSocket está actualmente conectado y listo para enviar.
    function isConnected() {
        return ws && ws.readyState === WebSocket.OPEN;
    }

    // Notifica el estado actual de la conexión al callback registrado.
    function _notifyStatus(status) {
        if (onStatusChangeCallback) onStatusChangeCallback(status);
    }

    return { connect, send, onMessage, onStatusChange, isConnected };
})();