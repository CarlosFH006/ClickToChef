// Módulo singleton que centraliza toda la comunicación con el servidor.
// Es la capa intermedia entre el WebSocket y las páginas de la cocina.
// Recibe mensajes del servidor, los adapta y los distribuye mediante callbacks.
const Api = (() => {
    // Diccionario de callbacks registrados por tipo de mensaje.
    // Cada página puede registrar una función para reaccionar a un tipo concreto.
    const handlers = {};

    // Al cargarse el módulo, se suscribe una sola vez al WebSocket.
    WebSocketService.onMessage((data) => {
        try {
            // Todos los mensajes entrantes pasan por handleMessage.
            handleMessage(JSON.parse(data));
        } catch (e) {
            console.error('[Api] Error procesando mensaje:', e);
        }
    });

    // Gestiona los mensajes que vienen del servidor
    function handleMessage(msg) {
        switch (msg.type) {
            case 'LOGIN_RESPONSE':
                _dispatch('LOGIN_RESPONSE', msg.payload);
                break;

            // Lista completa de detalles activos solicitada por la cocina.
            case 'DETALLES_PEDIDO_RESPONSE': {
                console.log('[Api] DETALLES_PEDIDO_RESPONSE recibido, items:', msg.payload?.length);
                const detalles = msg.payload.map(d => _mapearDetalle(d));
                console.log('[Api] Primer detalle:', detalles[0]);
                _dispatch('DETALLES_PEDIDO_RESPONSE', detalles);
                break;
            }

            // Actualización en tiempo real cuando cambia el estado de un plato.
            case 'DETALLE_DELETED': {
                console.log('[Api] DETALLE_DELETED recibido, id:', msg.payload?.id);
                _dispatch('DETALLE_DELETED', msg.payload);
                break;
            }

            case 'DETALLE_UPDATED': {
                console.log('[Api] DETALLE_UPDATED recibido, id:', msg.payload?.id);
                _dispatch('DETALLE_UPDATED', msg.payload);
                break;
            }

            // Confirmación del servidor tras cambiar el estado de un detalle.
            case 'UPDATE_ESTADO_DETALLE_RESPONSE':
                _dispatch('UPDATE_ESTADO_DETALLE_RESPONSE', msg.payload);
                break;

            // Actualización en tiempo real del estado de una mesa.
            case 'MESA_UPDATED':
                _dispatch('MESA_UPDATED', msg.payload);
                break;

            // Actualización en tiempo real de disponibilidad de productos.
            case 'STOCK_UPDATED':
                _dispatch('STOCK_UPDATED', msg.payload ?? []);
                break;

            // Nuevo pedido creado o actualizado en tiempo real.
            case 'PEDIDOS_UPDATED':
                _dispatch('PEDIDOS_UPDATED', msg.payload);
                break;

            // Nuevo ticket creado al cerrar una mesa.
            case 'TICKET_CREADO':
                _dispatch('TICKET_CREADO', msg.payload);
                break;

            // Lista de mesas para el panel de administración.
            case 'MESAS_RESPONSE':
                _dispatch('MESAS_RESPONSE', msg.payload?.mesas ?? []);
                break;

            // Menú completo para el panel de productos del administrador.
            case 'MENU_RESPONSE':
                _dispatch('MENU_RESPONSE', msg.payload);
                break;

            // Pedidos abiertos con sus detalles para el panel de administración.
            case 'PEDIDOS_ADMIN_RESPONSE':
                _dispatch('PEDIDOS_ADMIN_RESPONSE', msg.payload ?? []);
                break;

            // Lista de usuarios sin contraseña para el panel de administración.
            case 'USUARIOS_RESPONSE':
                _dispatch('USUARIOS_RESPONSE', msg.payload ?? []);
                break;

            // Lista de ingredientes para el panel de administración.
            case 'INGREDIENTES_RESPONSE':
                _dispatch('INGREDIENTES_RESPONSE', msg.payload ?? []);
                break;

            // Lista de tickets para el panel de administración.
            // El mapeo al modelo Ticket lo hace admin.js para no depender de esa clase aquí.
            case 'TICKETS_RESPONSE':
                _dispatch('TICKETS_RESPONSE', msg.payload ?? []);
                break;

            case 'MESA_CAPACIDAD_UPDATED':
                _dispatch('MESA_CAPACIDAD_UPDATED', msg.payload);
                break;

            case 'CREAR_CATEGORIA_RESPONSE':
                _dispatch('CREAR_CATEGORIA_RESPONSE', msg.payload);
                break;

            case 'CAMBIAR_PASSWORD_RESPONSE':
                _dispatch('CAMBIAR_PASSWORD_RESPONSE', msg.payload);
                break;

            case 'CREAR_USUARIO_RESPONSE':
                _dispatch('CREAR_USUARIO_RESPONSE', msg.payload);
                break;

            case 'SERVER_ERROR':
                console.error('[Api] Error del servidor:', msg.payload);
                _dispatch('SERVER_ERROR', msg.payload);
                break;

            default:
                console.warn('[Api] Tipo de mensaje desconocido:', msg.type);
        }
    }

    //Funcion privada para mapear los detalles de los pedidos que vienen del servidor
    function _mapearDetalle(d) {
        return new DetallePedido({
            id:              d.id,
            pedidoId:        d.pedidoId,
            productoId:      d.productoId,
            nombreProducto:  d.nombreProducto,
            cantidad:        d.cantidad,
            notasEspeciales: d.notasEspeciales,
            estado:          d.estado,
            hora:            d.horaPedido
        });
    }

    // Ejecuta el callback registrado para un tipo de mensaje, si existe.
    // Solo puede haber un handler activo por tipo — el último registrado sobreescribe al anterior.
    function _dispatch(type, payload) {
        if (handlers[type]) handlers[type](payload);
    }

    // Permite a cada página suscribirse a un tipo de mensaje concreto.
    function on(type, callback) {
        handlers[type] = callback;
    }

    // Envío genérico de mensajes al servidor a través del WebSocket.
    function sendMessage(type, payload) {
        return WebSocketService.send({ type, payload });
    }

    //Envio de mensaje de login
    function login(username, pass) {
        return sendMessage('LOGIN', { username, pass });
    }

    //Envio de mensaje para obtener los detalles de los pedidos activos
    function getDetallesPedido() {
        sendMessage('GET_DETALLES_PEDIDO', null);
    }

    //Envio de mensaje para cambiar el estado de un detalle
    function updateEstadoDetalle(id, estado) {
        sendMessage('UPDATE_ESTADO_DETALLE', { id, estado });
    }

    //Envio de mensaje para obtener las mesas
    function getMesas() {
        sendMessage('GET_MESAS', null);
    }

    //Envio de mensaje para obtener el menu completo
    function getMenu() {
        sendMessage('GET_MENU', null);
    }

    //Envio de mensaje para obtener todos los tickets
    function getTickets() {
        sendMessage('GET_TICKETS', null);
    }

    //Envio de mensaje para obtener todos los ingredientes
    function getIngredientes() {
        sendMessage('GET_INGREDIENTES', null);
    }

    //Envio de mensaje para obtener todos los usuarios sin contraseña
    function getUsuarios() {
        sendMessage('GET_USUARIOS', null);
    }

    //Envio de mensaje para obtener los pedidos abiertos con sus detalles
    function getPedidosAdmin() {
        sendMessage('GET_PEDIDOS_ADMIN', null);
    }

    //Envio de mensaje para crear una nueva categoría
    function crearCategoria(nombre) {
        sendMessage('CREAR_CATEGORIA', { nombre });
    }

    //Envio de mensaje para crear un nuevo usuario
    function crearUsuario(username, password, nombreCompleto, rol) {
        sendMessage('CREAR_USUARIO', { username, password, nombreCompleto, rol });
    }

    //Envio de mensaje para cambiar la contraseña de un usuario
    function cambiarPassword(id, password) {
        sendMessage('CAMBIAR_PASSWORD', { id, password });
    }

    //Exportar las funciones publicas
    return { on, sendMessage, login, getDetallesPedido, updateEstadoDetalle, getMesas, getMenu, getTickets, getIngredientes, getUsuarios, getPedidosAdmin, crearUsuario, cambiarPassword, crearCategoria };
})();