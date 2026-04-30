document.addEventListener('DOMContentLoaded', () => {

    // Actualiza el badge de estado del WebSocket en el header
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

        // Al conectar, solicitar todos los datos necesarios para los paneles
        if (status === 'connected') {
            Api.getMesas();
            Api.getMenu();
            Api.getTickets();
            Api.getIngredientes();
            Api.getUsuarios();
            Api.getPedidosAdmin();
        }
    });

    // --- Mesas ---
    // Renderiza la tabla con número, capacidad y estado de cada mesa
    Api.on('MESAS_RESPONSE', (mesas) => {
        const tbody = document.getElementById('tabla-mesas');
        if (!mesas.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-secundario text-sm">Sin mesas</td></tr>';
            return;
        }
        tbody.innerHTML = mesas.map(m => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${m.numero}</td>
                <td class="px-4 py-3 text-secundario">${m.capacidad} personas</td>
                <td class="px-4 py-3">${_badgeEstadoMesa(m.estado)}</td>
            </tr>
        `).join('');
    });

    // --- Categorías y Productos ---
    // Ambos vienen del mismo MENU_RESPONSE y se renderizan a la vez
    Api.on('MENU_RESPONSE', (categorias) => {

        // Tabla de categorías: id, nombre y número de productos
        const tbodyCat = document.getElementById('tabla-categorias');
        tbodyCat.innerHTML = categorias.map(cat => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${cat.id}</td>
                <td class="px-4 py-3 text-principal">${cat.nombre}</td>
                <td class="px-4 py-3 text-secundario">${cat.productos.length} productos</td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="px-4 py-8 text-center text-secundario text-sm">Sin categorías</td></tr>';

        // Botones de filtro por categoría para la sub-pestaña de productos
        const filtrosEl = document.getElementById('filtros-categoria');
        filtrosEl.innerHTML = `
            <button id="filtro-cat-todos" onclick="filtrarProductos(null)" class="filtro-cat-btn active">Todos</button>
            ${categorias.map(cat => `
                <button onclick="filtrarProductos(${cat.id})" class="filtro-cat-btn" id="filtro-cat-${cat.id}">${cat.nombre}</button>
            `).join('')}
        `;

        // Almacena todos los productos con su categoría para poder filtrarlos sin re-fetch
        const todosLosProductos = categorias.flatMap(cat =>
            cat.productos.map(p => ({ ...p, categoria: cat.nombre, categoriaId: cat.id }))
        );
        window._productosAdmin = todosLosProductos;
        _renderProductos(todosLosProductos);
    });

    // --- Ingredientes ---
    // Muestra id, nombre, stock actual, stock reservado, unidad y tipo
    Api.on('INGREDIENTES_RESPONSE', (ingredientes) => {
        const tbody = document.getElementById('tabla-ingredientes');
        if (!ingredientes.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-secundario text-sm">Sin ingredientes</td></tr>';
            return;
        }
        tbody.innerHTML = ingredientes.map(i => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${i.id}</td>
                <td class="px-4 py-3 text-principal">${i.nombre}</td>
                <td class="px-4 py-3 text-principal">${i.stockActual}</td>
                <td class="px-4 py-3 text-secundario">${i.stockReservado}</td>
                <td class="px-4 py-3 text-secundario">${i.metodoMedida ?? '—'}</td>
                <td class="px-4 py-3 text-secundario">${i.tipoIngrediente ?? '—'}</td>
            </tr>
        `).join('');
    });

    // --- Tickets ---
    // Muestra id, pedido, total, método de pago, fecha y referencia de Odoo
    Api.on('TICKETS_RESPONSE', (tickets) => {
        const tbody = document.getElementById('tabla-tickets');
        if (!tickets.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-secundario text-sm">Sin tickets</td></tr>';
            return;
        }
        tbody.innerHTML = tickets.map(t => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">#${t.id}</td>
                <td class="px-4 py-3 text-secundario">#${t.pedidoId}</td>
                <td class="px-4 py-3 text-principal font-semibold">${t.totalImporte.toFixed(2)} €</td>
                <td class="px-4 py-3 text-secundario">${_badgeMetodoPago(t.metodoPago)}</td>
                <td class="px-4 py-3 text-secundario">${_formatFecha(t.fechaPago)}</td>
                <td class="px-4 py-3 text-secundario font-mono text-xs">${t.referenciaFacturaOdoo}</td>
            </tr>
        `).join('');
    });

    // --- Usuarios ---
    // Muestra id, username y rol (sin contraseña)
    Api.on('USUARIOS_RESPONSE', (usuarios) => {
        const tbody = document.getElementById('tabla-usuarios');
        if (!usuarios.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-secundario text-sm">Sin usuarios</td></tr>';
            return;
        }
        tbody.innerHTML = usuarios.map(u => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${u.id}</td>
                <td class="px-4 py-3 text-principal">${u.username}</td>
                <td class="px-4 py-3">${_badgeRol(u.rol)}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="abrirModalPassword(${u.id}, '${u.username}')"
                        class="text-xs text-primary border border-primary/30 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors">
                        Cambiar contraseña
                    </button>
                </td>
            </tr>
        `).join('');
    });

    Api.on('CAMBIAR_PASSWORD_RESPONSE', ({ success }) => {
        const msg = document.getElementById('cambiar-password-msg');
        if (success) {
            msg.textContent = '✓ Contraseña cambiada correctamente';
            msg.className = 'text-sm text-green-600';
            msg.classList.remove('hidden');
            setTimeout(() => cerrarModalPassword(), 1500);
        } else {
            msg.textContent = 'Error al cambiar la contraseña';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
    });

    // --- Pedidos ---
    Api.on('PEDIDOS_ADMIN_RESPONSE', (pedidos) => {
        window._pedidosAdmin = pedidos;
        _renderFiltrosEstado(pedidos);
        _renderPedidos(pedidos);
    });

    // El panel reacciona a los broadcasts del servidor sin que el usuario haga nada

    // Mesa cambió de estado → refrescar tabla de mesas
    Api.on('MESA_UPDATED', () => Api.getMesas());

    // Stock cambió → actualizar badges de disponibilidad y refrescar ingredientes
    Api.on('STOCK_UPDATED', (noDisponibles) => {
        _actualizarStockProductos(noDisponibles);
        Api.getIngredientes();
    });

    // Pedido creado o actualizado → refrescar pedidos e ingredientes
    Api.on('PEDIDOS_UPDATED', () => {
        Api.getPedidosAdmin();
        Api.getIngredientes();
    });

    // Ticket creado al cerrar una mesa → refrescar tabla de tickets
    Api.on('TICKET_CREADO', () => Api.getTickets());

    Api.on('CREAR_USUARIO_RESPONSE', ({ success }) => {
        const msg = document.getElementById('crear-usuario-msg');
        if (success) {
            document.getElementById('nuevo-username').value = '';
            document.getElementById('nuevo-password').value = '';
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-rol').value = 'CAMARERO';
            Api.getUsuarios();
            setTimeout(() => cerrarModalUsuario(), 800);
        } else {
            msg.textContent = 'Error: el usuario ya existe o los datos son inválidos';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
    });

    // Detalle actualizado → cambia el badge de estado en la fila ya renderizada
    // y actualiza el estado en el array en memoria para mantener coherencia
    Api.on('DETALLE_UPDATED', ({ id, estado }) => {
        // Actualizar en memoria
        if (window._pedidosAdmin) {
            window._pedidosAdmin = window._pedidosAdmin.map(p => ({
                ...p,
                detalles: (p.detalles ?? []).map(d => d.id === id ? { ...d, estado } : d)
            }));
        }
        // Actualizar solo la celda de estado en el DOM sin re-renderizar la tabla
        const fila = document.querySelector(`[data-detalle-id="${id}"]`);
        if (fila) {
            const celdaEstado = fila.children[2];
            if (celdaEstado) celdaEstado.innerHTML = _badgeEstadoDetalle(estado);
        }
    });

    // Detalle eliminado → quitar la fila del DOM y refrescar pedidos e ingredientes
    Api.on('DETALLE_DELETED', ({ id }) => {
        document.querySelectorAll(`[data-detalle-id="${id}"]`).forEach(tr => tr.remove());
        Api.getPedidosAdmin();
        Api.getIngredientes();
    });

    WebSocketService.connect();
});

// --- Navegación entre paneles principales ---

// Muestra el panel seleccionado y oculta el resto
function mostrarPanel(nombre) {
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.panel-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + nombre).classList.remove('hidden');
    document.getElementById('btn-' + nombre).classList.add('active');
}

// Muestra la sub-pestaña seleccionada dentro del panel de Productos
function mostrarSubPanel(nombre) {
    document.querySelectorAll('[id^="subpanel-"]').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('subpanel-' + nombre).classList.remove('hidden');
    document.getElementById('subtab-' + nombre).classList.add('active');
}

// --- Helpers de renderizado ---

// Genera un badge de color según el tipo (success, error, warning, primary)
function _badge(texto, tipo) {
    const clases = {
        success: 'bg-green-100 text-green-700',
        error:   'bg-red-100 text-error',
        warning: 'bg-yellow-100 text-warning',
        primary: 'bg-blue-100 text-primary',
    };
    return `<span class="text-xs font-semibold px-2 py-0.5 rounded-full ${clases[tipo] || ''}">${texto}</span>`;
}

function _badgeEstadoMesa(estado) {
    const mapa = {
        LIBRE:     ['Libre',     'success'],
        OCUPADA:   ['Ocupada',   'error'],
        RESERVADA: ['Reservada', 'warning'],
    };
    const [texto, tipo] = mapa[estado] || [estado, 'primary'];
    return _badge(texto, tipo);
}

function _badgeRol(rol) {
    const mapa = {
        CAMARERO: ['Camarero', 'primary'],
        COCINERO: ['Cocinero', 'warning'],
        ADMIN:    ['Admin',    'error'],
    };
    const [texto, tipo] = mapa[rol?.toUpperCase()] || [rol, 'primary'];
    return _badge(texto, tipo);
}

function _badgeMetodoPago(metodo) {
    const mapa = {
        EFECTIVO: ['Efectivo', 'success'],
        TARJETA:  ['Tarjeta',  'primary'],
    };
    const [texto, tipo] = mapa[metodo?.toUpperCase()] || [metodo, 'primary'];
    return _badge(texto, tipo);
}

function _badgeEstadoPedido(estado) {
    const mapa = {
        ABIERTA:   ['Abierta',   'success'],
        CERRADA:   ['Cerrada',   'error'],
        CANCELADO: ['Cancelado', 'warning'],
    };
    const [texto, tipo] = mapa[estado?.toUpperCase()] || [estado, 'primary'];
    return _badge(texto, tipo);
}

function _badgeEstadoDetalle(estado) {
    const mapa = {
        PENDIENTE:      ['Pendiente',      'warning'],
        EN_PREPARACION: ['En preparación', 'primary'],
        LISTO:          ['Listo',          'success'],
        SERVIDO:        ['Servido',        'error'],
    };
    const [texto, tipo] = mapa[estado?.toUpperCase()] || [estado, 'primary'];
    return _badge(texto, tipo);
}

// Formatea una fecha ISO a formato local español
function _formatFecha(fecha) {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// --- Lógica de productos ---

// Filtra la tabla de productos por categoría y actualiza el botón activo
function filtrarProductos(categoriaId) {
    const productos = window._productosAdmin ?? [];
    const filtrados = categoriaId === null ? productos : productos.filter(p => p.categoriaId === categoriaId);

    document.querySelectorAll('.filtro-cat-btn').forEach(b => b.classList.remove('active'));
    const btnId = categoriaId === null ? 'filtro-cat-todos' : `filtro-cat-${categoriaId}`;
    document.getElementById(btnId)?.classList.add('active');

    _renderProductos(filtrados);
}

// Actualiza la disponibilidad de los productos en memoria y re-renderiza
// sin hacer una nueva petición al servidor
function _actualizarStockProductos(noDisponibles) {
    if (!window._productosAdmin) return;
    window._productosAdmin = window._productosAdmin.map(p => ({
        ...p,
        disponible: !noDisponibles.includes(p.id)
    }));
    const btnActivo = document.querySelector('.filtro-cat-btn.active');
    const catId = btnActivo?.id === 'filtro-cat-todos'
        ? null
        : parseInt(btnActivo?.id?.replace('filtro-cat-', ''));
    filtrarProductos(catId ?? null);
}

// Genera los botones de filtro por estado de pedido
let _passwordUserId = null;

function abrirModalPassword(id, username) {
    _passwordUserId = id;
    document.getElementById('modal-password-nombre').textContent = `Usuario: ${username}`;
    document.getElementById('nueva-password').value = '';
    document.getElementById('cambiar-password-msg').classList.add('hidden');
    const modal = document.getElementById('modal-password');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalPassword() {
    _passwordUserId = null;
    const modal = document.getElementById('modal-password');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitCambiarPassword() {
    const password = document.getElementById('nueva-password').value.trim();
    if (!password) {
        const msg = document.getElementById('cambiar-password-msg');
        msg.textContent = 'Introduce la nueva contraseña';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.cambiarPassword(_passwordUserId, password);
}

function abrirModalUsuario() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalUsuario() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('crear-usuario-msg').classList.add('hidden');
}

function submitCrearUsuario() {
    const username     = document.getElementById('nuevo-username').value.trim();
    const password     = document.getElementById('nuevo-password').value.trim();
    const nombreCompleto = document.getElementById('nuevo-nombre').value.trim();
    const rol          = document.getElementById('nuevo-rol').value;
    if (!username || !password || !nombreCompleto) {
        const msg = document.getElementById('crear-usuario-msg');
        msg.textContent = 'Rellena todos los campos';
        msg.className = 'ml-3 text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.crearUsuario(username, password, nombreCompleto, rol);
}

function _renderFiltrosEstado(pedidos) {
    const filtrosEl = document.getElementById('filtros-estado-pedido');
    if (!filtrosEl) return;
    const estados = ['TODOS', ...new Set(pedidos.map(p => p.estado?.toUpperCase()).filter(Boolean))];
    filtrosEl.innerHTML = estados.map((e, i) => `
        <button onclick="filtrarPedidos('${e}')" id="filtro-pedido-${e}"
            class="filtro-cat-btn ${i === 0 ? 'active' : ''}">
            ${e === 'TODOS' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase()}
        </button>
    `).join('');
}

function filtrarPedidos(estado) {
    document.querySelectorAll('#filtros-estado-pedido .filtro-cat-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`filtro-pedido-${estado}`)?.classList.add('active');
    const todos = window._pedidosAdmin ?? [];
    const filtrados = estado === 'TODOS' ? todos : todos.filter(p => p.estado?.toUpperCase() === estado);
    _renderPedidos(filtrados);
}

function _renderPedidos(pedidos) {
    const tbody = document.getElementById('tabla-pedidos');
    if (!pedidos.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-secundario text-sm">Sin pedidos</td></tr>';
        return;
    }
    tbody.innerHTML = pedidos.map(p => `
        <tr class="hover:bg-fondo transition-colors cursor-pointer" onclick="toggleDetalles(${p.id})">
            <td class="px-4 py-3 text-principal font-medium">#${p.id}</td>
            <td class="px-4 py-3 text-secundario">Mesa ${p.mesaId}</td>
            <td class="px-4 py-3 text-secundario">Usuario ${p.usuarioId}</td>
            <td class="px-4 py-3">${_badgeEstadoPedido(p.estado)}</td>
            <td class="px-4 py-3 text-secundario">${_formatFecha(p.fechaCreacion)}</td>
        </tr>
        <tr id="detalles-${p.id}" class="hidden bg-fondo">
            <td colspan="5" class="px-8 py-3">
                <table class="w-full text-xs">
                    <thead><tr class="text-secundario uppercase tracking-wide">
                        <th class="text-left py-1 pr-4">Producto</th>
                        <th class="text-left py-1 pr-4">Cantidad</th>
                        <th class="text-left py-1 pr-4">Estado</th>
                        <th class="text-left py-1">Notas</th>
                    </tr></thead>
                    <tbody>
                        ${(p.detalles ?? []).map(d => `
                            <tr data-detalle-id="${d.id}">
                                <td class="py-1 pr-4 text-principal">${d.nombreProducto}</td>
                                <td class="py-1 pr-4 text-secundario">${d.cantidad}</td>
                                <td class="py-1 pr-4">${_badgeEstadoDetalle(d.estado)}</td>
                                <td class="py-1 text-secundario italic">${d.notasEspeciales || '—'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        </tr>
    `).join('');
}

// Renderiza la tabla de productos con los datos recibidos
function _renderProductos(productos) {
    const tbody = document.getElementById('tabla-productos');
    tbody.innerHTML = productos.map(p => `
        <tr class="hover:bg-fondo transition-colors">
            <td class="px-4 py-3 text-principal font-medium">${p.id}</td>
            <td class="px-4 py-3 text-principal">${p.nombre}</td>
            <td class="px-4 py-3 text-secundario">${p.categoria}</td>
            <td class="px-4 py-3 text-principal">${p.precio.toFixed(2)} €</td>
            <td class="px-4 py-3">${p.disponible ? _badge('Disponible', 'success') : _badge('No disponible', 'error')}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-secundario text-sm">Sin productos</td></tr>';
}

// --- Lógica de pedidos ---

// Expande o colapsa la sub-tabla de detalles de un pedido al hacer click en su fila
function toggleDetalles(pedidoId) {
    const fila = document.getElementById(`detalles-${pedidoId}`);
    fila?.classList.toggle('hidden');
}