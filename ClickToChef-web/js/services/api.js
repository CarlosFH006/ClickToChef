const Api = (() => {
    const handlers = {};

    // Registra el listener global de mensajes WebSocket
    WebSocketService.onMessage((data) => {
        try {
            handleMessage(JSON.parse(data));
        } catch (e) {
            console.error('[Api] Error procesando mensaje:', e);
        }
    });

    function handleMessage(msg) {
        switch (msg.type) {
            case 'LOGIN_RESPONSE':
                _dispatch('LOGIN_RESPONSE', msg.payload);
                break;
            case 'DETALLES_PEDIDO_RESPONSE': {
                console.log('[Api] DETALLES_PEDIDO_RESPONSE recibido, items:', msg.payload?.length);
                const detalles = msg.payload.map(d => new Pedido({
                    id:               d.id,
                    pedido_id:        d.pedidoId,
                    producto_id:      d.productoId,
                    nombre_producto:  d.nombreProducto,
                    cantidad:         d.cantidad,
                    notas_especiales: d.notasEspeciales,
                    estado:           d.estado,
                    hora:             d.horaPedido
                }));
                console.log('[Api] Primer detalle:', detalles[0]);
                _dispatch('DETALLES_PEDIDO_RESPONSE', detalles);
                break;
            }
            default:
                console.warn('[Api] Tipo de mensaje desconocido:', msg.type);
        }
    }

    function _dispatch(type, payload) {
        if (handlers[type]) handlers[type](payload);
    }

    // Permite a cada página registrar un callback para un tipo de mensaje
    function on(type, callback) {
        handlers[type] = callback;
    }

    function sendMessage(type, payload) {
        return WebSocketService.send({ type, payload });
    }

    function login(username, pass) {
        sendMessage('LOGIN', { username, pass });
    }

    function getDetallesPedido() {
        sendMessage('GET_DETALLES_PEDIDO', null);
    }

    return { on, sendMessage, login, getDetallesPedido };
})();
