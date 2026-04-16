const ESTADOS = ['PENDIENTE', 'EN_PREPARACION', 'LISTO'];

const COLOR_ESTADO = {
    PENDIENTE:      'border-l-warning',
    EN_PREPARACION: 'border-l-primary',
    LISTO:          'border-l-success',
};

const ORDEN_ESTADO = { PENDIENTE: 0, EN_PREPARACION: 1, LISTO: 2 };

document.addEventListener('DOMContentLoaded', () => {

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

        if (status === 'connected') Api.getDetallesPedido();
    });

    Api.on('DETALLES_PEDIDO_RESPONSE', renderKanban);

    // Drop zones — se registran UNA SOLA VEZ
    ESTADOS.forEach(estado => {
        const col = document.getElementById(`col-${estado}`);

        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');
        });

        // dragleave solo actúa si realmente salimos de la columna (no al entrar en un hijo)
        col.addEventListener('dragleave', (e) => {
            if (!col.contains(e.relatedTarget)) {
                col.classList.remove('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');
            }
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('ring-2', 'ring-primary', 'ring-inset', 'rounded-xl');

            const id     = parseInt(e.dataTransfer.getData('detalleId'));
            const origen = e.dataTransfer.getData('estadoOrigen');

            if (ORDEN_ESTADO[estado] === ORDEN_ESTADO[origen] + 1) {
                Api.updateEstadoDetalle(id, estado);
            }
        });
    });

    WebSocketService.connect();
});

function renderKanban(detalles) {
    // Limpiar columnas y contadores
    ESTADOS.forEach(estado => {
        document.getElementById(`col-${estado}`).innerHTML = '';
        document.getElementById(`count-${estado}`).textContent = '0';
    });

    const grupos = {};
    ESTADOS.forEach(e => grupos[e] = []);

    detalles
        .slice()
        .sort((a, b) => new Date(a.hora) - new Date(b.hora))
        .forEach(detalle => {
            if (grupos[detalle.estado] !== undefined) grupos[detalle.estado].push(detalle);
        });

    ESTADOS.forEach(estado => {
        const col   = document.getElementById(`col-${estado}`);
        const lista = grupos[estado];
        document.getElementById(`count-${estado}`).textContent = lista.length;
        lista.forEach(detalle => col.appendChild(crearTarjeta(detalle)));
    });
}

function crearTarjeta(detalle) {
    const hora = detalle.hora
        ? new Date(detalle.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : '—';

    const card = document.createElement('div');
    card.className = `bg-superficie rounded-xl border border-borde border-l-4 ${COLOR_ESTADO[detalle.estado] || 'border-l-borde'} p-4 shadow-sm cursor-grab active:cursor-grabbing select-none`;
    card.draggable = true;

    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('detalleId', detalle.id);
        e.dataTransfer.setData('estadoOrigen', detalle.estado);
        // pequeño delay para que el ghost se vea antes de aplicar la opacidad
        setTimeout(() => card.classList.add('opacity-40'), 0);
    });

    card.addEventListener('dragend', () => card.classList.remove('opacity-40'));

    card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-xs font-semibold text-secundario">Pedido #${detalle.pedido_id}</span>
            <span class="text-xs text-secundario">${hora}</span>
        </div>
        <p class="text-sm font-semibold text-principal mb-1">${detalle.nombre_producto}</p>
        <p class="text-sm text-secundario">Cantidad: <span class="font-medium text-principal">${detalle.cantidad}</span></p>
        ${detalle.notas_especiales ? `<p class="text-xs text-secundario mt-2 italic">${detalle.notas_especiales}</p>` : ''}
    `;

    return card;
}