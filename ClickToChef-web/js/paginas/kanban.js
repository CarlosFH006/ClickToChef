const ESTADOS = ['PENDIENTE', 'EN_PREPARACION', 'LISTO'];

const COLOR_ESTADO = {
    PENDIENTE:      'border-l-warning',
    EN_PREPARACION: 'border-l-primary',
    LISTO:          'border-l-success',
};

document.addEventListener('DOMContentLoaded', () => {

    // Estado del WebSocket en el header
    WebSocketService.onStatusChange((status) => {
        const el = document.getElementById('ws-status');
        const labels = {
            connecting:    { text: 'Conectando...', cls: 'bg-gray-100 text-secundario' },
            connected:     { text: 'Conectado',     cls: 'bg-green-100 text-green-700' },
            disconnected:  { text: 'Desconectado',  cls: 'bg-red-100 text-error' },
            error:         { text: 'Error',          cls: 'bg-red-100 text-error' },
        };
        const s = labels[status] || labels.disconnected;
        el.textContent = s.text;
        el.className = `ml-auto text-xs px-2 py-1 rounded-full ${s.cls}`;

        console.log('[Kanban] WS status:', status);
        if (status === 'connected') {
            Api.getDetallesPedido();
        }
    });

    Api.on('DETALLES_PEDIDO_RESPONSE', renderKanban);

    WebSocketService.connect();
});

// Convierte el estado a ID de HTML (sin espacios)
function estadoId(estado) {
    return estado.replace(' ', '_');
}

function renderKanban(detalles) {
    console.log('[Kanban] renderKanban llamado con', detalles?.length, 'detalles');
    // Limpiar columnas y contadores
    ESTADOS.forEach(estado => {
        document.getElementById(`col-${estadoId(estado)}`).innerHTML = '';
        document.getElementById(`count-${estadoId(estado)}`).textContent = '0';
    });

    // Agrupar por estado (tal como llega del servidor: minúsculas con espacio)
    const grupos = {};
    ESTADOS.forEach(e => grupos[e] = []);

    detalles
        .slice()
        .sort((a, b) => new Date(a.hora) - new Date(b.hora))
        .forEach(detalle => {
            if (grupos[detalle.estado] !== undefined) grupos[detalle.estado].push(detalle);
        });

    // Renderizar tarjetas
    ESTADOS.forEach(estado => {
        const col = document.getElementById(`col-${estadoId(estado)}`);
        const lista = grupos[estado];
        document.getElementById(`count-${estadoId(estado)}`).textContent = lista.length;

        lista.forEach(detalle => {
            col.appendChild(crearTarjeta(detalle));
        });
    });
}

function crearTarjeta(detalle) {
    const hora = detalle.hora
        ? new Date(detalle.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : '—';

    const colorBorde = COLOR_ESTADO[detalle.estado] || 'border-l-borde';

    const card = document.createElement('div');
    card.className = `bg-superficie rounded-xl border border-borde border-l-4 ${colorBorde} p-4 shadow-sm`;
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
