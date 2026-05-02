//Estados de los pedidos
const ESTADOS = ['PENDIENTE', 'EN_PREPARACION', 'LISTO'];

//Colores de los estados
const COLOR_ESTADO = {
    PENDIENTE:      'border-l-warning',
    EN_PREPARACION: 'border-l-primary',
    LISTO:          'border-l-success',
};

//Orden de los estados
const ORDEN_ESTADO = { PENDIENTE: 0, EN_PREPARACION: 1, LISTO: 2 };

//Lista de detalles actual
let detallesActuales = [];

document.addEventListener('DOMContentLoaded', () => {

    // Verificar que el usuario es COCINERO
    const _usuarioGuardado = localStorage.getItem('usuario');
    if (!_usuarioGuardado) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }
    const _usuarioKanban = JSON.parse(_usuarioGuardado);
    if (_usuarioKanban.rol !== 'COCINERO') {
        alert('No tienes permisos para acceder al panel de cocina.');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
        return;
    }

    // Estado del WebSocket en el header
    WebSocketService.onStatusChange((status) => {
        const el = document.getElementById('ws-status');
        const labels = {
            connecting:   { text: 'Conectando...', cls: 'bg-gray-100 text-secundario' },
            connected:    { text: 'Conectado',     cls: 'bg-green-100 text-green-700' },
            disconnected: { text: 'Desconectado',  cls: 'bg-red-100 text-error' },
            error:        { text: 'Error',          cls: 'bg-red-100 text-error' },
        };
        const s = labels[status] || labels.disconnected;
        el.textContent = s.text;
        el.className = `ml-auto text-xs px-2 py-1 rounded-full ${s.cls}`;

        //Si el websocket esta conectado, obtener los detalles de los pedidos
        if (status === 'connected') Api.getDetallesPedido();
    });

    //Gestionar la respuesta de los detalles del pedido
    Api.on('DETALLES_PEDIDO_RESPONSE', (detalles) => {
        detallesActuales = detalles;
        //Renderizar el kanban
        renderKanban();
    });

    //Gestionar la respuesta de la actualizacion de un detalle
    Api.on('DETALLE_UPDATED', (detalle) => {
        updateDetalle(detalle);
    });

    Api.on('DETALLE_DELETED', ({ id }) => {
        detallesActuales = detallesActuales.filter(d => d.id !== id);
        renderKanban();
    });

    // Drop zones — se registran UNA SOLA VEZ
    ESTADOS.forEach(estado => {
        //Bucle de registro de columnas
        const col = document.getElementById(`col-${estado}`);

        //Evento dragover
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            //Cambiar el color de los bordes de la columna
            col.classList.add('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');
        });

        //Evento dragleave
        col.addEventListener('dragleave', (e) => {
            if (!col.contains(e.relatedTarget)) {
                //Quitar el color de los bordes de la columna
                col.classList.remove('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');
            }
        });

        //Evento drop
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            //Quitar el color de los bordes de la columna
            col.classList.remove('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');

            //Obtener el id y el origen de donde viene ese detalle
            const id     = parseInt(e.dataTransfer.getData('detalleId'));
            const origen = e.dataTransfer.getData('estadoOrigen');

            //Validar que el estado sea correcto, que solo se permita pasar al siguiente estado
            if (ORDEN_ESTADO[estado] === ORDEN_ESTADO[origen] + 1) {
                //Actualizar el estado del detalle
                Api.updateEstadoDetalle(id, estado);
            }
        });
    });

    //Conectar al websocket
    WebSocketService.connect();
});

//Actualizar los detalles de los pedidos
function updateDetalle(detalle) {
    //Si el detalle esta servido, eliminarlo de la lista
    if (detalle.estado === 'SERVIDO') {
        detallesActuales = detallesActuales.filter(d => d.id !== detalle.id);
    } else {
        //Actualizar el estado del detalle
        const index = detallesActuales.findIndex(d => d.id === detalle.id);
        if (index !== -1) {
            detallesActuales[index].estado = detalle.estado;
        }
    }
    //Renderizar el kanban
    renderKanban();
}

//Renderizar el kanban
function renderKanban() {
    // Limpiar columnas y contadores, para no duplicar detalles
    ESTADOS.forEach(estado => {
        document.getElementById(`col-${estado}`).innerHTML = '';
        document.getElementById(`count-${estado}`).textContent = '0';
    });

    //Agrupar los detalles por estado
    const grupos = {};
    ESTADOS.forEach(e => grupos[e] = []);

    //Crear una copia superficial del array, ordenarlo por hora y agregar cada detalle al grupo correspondiente
    detallesActuales
        .slice()
        .sort((a, b) => new Date(a.hora) - new Date(b.hora))
        .forEach(detalle => {
            if (grupos[detalle.estado] !== undefined) grupos[detalle.estado].push(detalle);
        });

        //Renderizar los detalles
        ESTADOS.forEach(estado => {
        //Por cada estado, obtener la columna y la lista de detalles
        const col   = document.getElementById(`col-${estado}`);
        const lista = grupos[estado];
        //Actualizar el contador de detalles
        document.getElementById(`count-${estado}`).textContent = lista.length;
        //Agregar cada detalle a la columna
        lista.forEach(detalle => col.appendChild(crearTarjeta(detalle)));
    });
}

//Crear tarjeta de detalle
function crearTarjeta(detalle) {
    //Convertir la hora a formato HH:MM
    const hora = detalle.hora
        ? new Date(detalle.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : '—';
    
    //Crear la tarjeta
    const card = document.createElement('div');
    //Estilos de la tarjeta
    card.className = `bg-superficie rounded-xl border border-borde border-l-4 ${COLOR_ESTADO[detalle.estado] || 'border-l-borde'} p-4 shadow-sm cursor-grab active:cursor-grabbing select-none`;
    //Hacer la tarjeta arrastrable
    card.draggable = true;
    //Agregar eventos de drag
    card.addEventListener('dragstart', (e) => {
        //Indica que se va a mover y no a copiar, es decir, que solo se mueva la tarjeta, sin hacer una copia
        e.dataTransfer.effectAllowed = 'move';
        //Guardar el id y el estado del detalle, para que la columna receptora sepa de dónde viene
        e.dataTransfer.setData('detalleId', detalle.id);
        e.dataTransfer.setData('estadoOrigen', detalle.estado);
        //Esto hace que la tarjeta se vea difuminada mientras se arrastra
        setTimeout(() => card.classList.add('opacity-40'), 0);
    });

    //Cuando la tarjeta se suelta, quitar la opacidad
    card.addEventListener('dragend', () => card.classList.remove('opacity-40'));

    //Contenido HTML de la tarjeta
    card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-xs font-semibold text-secundario">Pedido #${detalle.pedidoId}</span>
            <span class="text-xs text-secundario">${hora}</span>
        </div>
        <p class="text-sm font-semibold text-principal mb-1">${detalle.nombreProducto}</p>
        <p class="text-sm text-secundario">Cantidad: <span class="font-medium text-principal">${detalle.cantidad}</span></p>
        ${detalle.notasEspeciales ? `<p class="text-xs text-secundario mt-2 italic">${detalle.notasEspeciales}</p>` : ''}
    `;

    return card;
}