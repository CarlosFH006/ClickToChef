const WebSocketService = (() => {
    let ws = null;
    let onMessageCallback = null;
    let onStatusChangeCallback = null;

    function connect() {
        _notifyStatus("connecting");

        ws = new WebSocket(CONFIG.WS_URL);

        ws.onopen = () => {
            _notifyStatus("connected");
        };

        ws.onclose = () => {
            _notifyStatus("disconnected");
            setTimeout(connect, 3000);
        };

        ws.onerror = () => {
            _notifyStatus("error");
        };

        ws.onmessage = (event) => {
            if (onMessageCallback) onMessageCallback(event.data);
        };
    }

    function send(data) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
            return true;
        }
        return false;
    }

    function onMessage(callback) {
        onMessageCallback = callback;
    }

    function onStatusChange(callback) {
        onStatusChangeCallback = callback;
    }

    function isConnected() {
        return ws && ws.readyState === WebSocket.OPEN;
    }

    function _notifyStatus(status) {
        if (onStatusChangeCallback) onStatusChangeCallback(status);
    }

    return { connect, send, onMessage, onStatusChange, isConnected };
})();
