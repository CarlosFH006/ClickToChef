// Módulo singleton que gestiona la conexión WebSocket con el servidor.
// Envuelve el WebSocket nativo del navegador y expone una interfaz limpia
// para conectar, enviar mensajes y reaccionar a cambios de estado.
const WebSocketService = (() => {
    // Instancia del WebSocket nativo. Null hasta que se llama a connect().
    let ws = null;
    // Callback que recibirá los mensajes en bruto del servidor. Lo registra api.js.
    let onMessageCallback = null;
    // Callback que recibirá los cambios de estado de la conexión. Lo registra kanban.js.
    let onStatusChangeCallback = null;

    // Abre la conexión WebSocket con el servidor.
    // Si la conexión se pierde, se reintenta automáticamente cada 3 segundos.
    function connect() {
        _notifyStatus("connecting");

        const url = 'ws://'+CONFIG.WS_IP+':'+CONFIG.WS_PORT
        ws = new WebSocket(url);

        // Conexión establecida correctamente
        ws.onopen = () => {
            _notifyStatus("connected");
        };

        // Conexión cerrada — puede ser por red o por el servidor.
        // Reintenta la conexión tras 3 segundos formando un bucle de reconexión.
        ws.onclose = () => {
            _notifyStatus("disconnected");
            setTimeout(connect, 3000);
        };

        // Error de conexión — notifica el estado y alerta al usuario.
        ws.onerror = () => {
            _notifyStatus("error");
            alert("No hay conexión con el servidor")
        };

        // Mensaje recibido del servidor — pasa los datos en bruto al callback registrado.
        ws.onmessage = (event) => {
            if (onMessageCallback) onMessageCallback(event.data);
        };
    }

    // Envía datos al servidor si la conexión está abierta.
    // Acepta string o objeto — si es objeto lo serializa a JSON automáticamente.
    // Devuelve true si el envío fue exitoso, false si la conexión no está disponible.
    function send(data) {
        if (ws && ws.readyState === WebSocket.OPEN) {
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
    // Estados posibles: 'connecting', 'connected', 'disconnected', 'error'.
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