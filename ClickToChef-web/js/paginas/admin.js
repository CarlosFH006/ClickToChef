document.addEventListener('DOMContentLoaded', () => {

    // Verificar que el usuario es ADMIN
    const _usuarioGuardado = localStorage.getItem('usuario');
    if (!_usuarioGuardado) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }
    const _usuarioAdmin = JSON.parse(_usuarioGuardado);
    if (_usuarioAdmin.rol !== 'ADMIN') {
        alert('No tienes permisos para acceder al panel de administración.');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
        return;
    }

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
            Api.getCategoriasAdmin();
            Api.getTickets();
            Api.getIngredientes();
            Api.getUsuarios();
            Api.getPedidosAdmin();
        }
    });

    // --- Mesas ---
    // Renderiza la tabla con número, capacidad y estado de cada mesa
    Api.on('MESAS_RESPONSE', (mesas) => {
        window._mesasAdmin = mesas;
        _renderMesas(mesas);
    });

    // Todas las categorías (incluye vacías) — tabla de categorías del admin
    Api.on('CATEGORIAS_ADMIN_RESPONSE', (cats) => {
        const tbodyCat = document.getElementById('tabla-categorias');
        tbodyCat.innerHTML = cats.map(cat => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${cat.id}</td>
                <td class="px-4 py-3 text-principal">${cat.nombre}</td>
            </tr>
        `).join('') || '<tr><td colspan="2" class="px-4 py-8 text-center text-secundario text-sm">Sin categorías</td></tr>';
        window._categoriasAdmin = cats.map(c => ({ id: c.id, nombre: c.nombre }));
    });

    // --- Categorías y Productos ---
    // MENU_RESPONSE gestiona los filtros y la tabla de productos (solo categorías con productos)
    Api.on('MENU_RESPONSE', (categorias) => {

        // Botones de filtro por categoría para la sub-pestaña de productos
        const filtrosEl = document.getElementById('filtros-categoria');
        filtrosEl.innerHTML = `
            <button id="filtro-cat-todos" onclick="filtrarProductos(null)" class="filtro-cat-btn active">Todos</button>
            ${categorias.map(cat => `
                <button onclick="filtrarProductos(${cat.id})" class="filtro-cat-btn" id="filtro-cat-${cat.id}">${cat.nombre}</button>
            `).join('')}
        `;

        // Cache de categorías para el autocomplete del modal de producto
        window._categoriasAdmin = categorias.map(c => ({ id: c.id, nombre: c.nombre }));

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
        window._ingredientesAdmin = ingredientes; // cache para el modal de producto
        const tbody = document.getElementById('tabla-ingredientes');
        if (!ingredientes.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-secundario text-sm">Sin ingredientes</td></tr>';
            return;
        }
        tbody.innerHTML = ingredientes.map(i => `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${i.id}</td>
                <td class="px-4 py-3 text-principal">${i.nombre}</td>
                <td class="px-4 py-3 text-principal font-medium">${i.stockActual}</td>
                <td class="px-4 py-3 text-secundario">${i.stockReservado}</td>
                <td class="px-4 py-3 text-secundario">${i.metodoMedida ?? '—'}</td>
                <td class="px-4 py-3 text-secundario">${i.tipoIngrediente ?? '—'}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="abrirModalSumarStock(${i.id}, '${i.nombre}', ${i.stockActual}, '${i.metodoMedida}')"
                        class="inline-flex items-center gap-1 text-xs text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">
                        <ion-icon name="add-outline" style="font-size:12px"></ion-icon>
                        Sumar
                    </button>
                </td>
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

    Api.on('RECETA_PRODUCTO_RESPONSE', ({ productoId, ingredientes }) => {
        const body = document.getElementById('modal-receta-body');
        if (!ingredientes.length) {
            body.innerHTML = '<p class="text-sm text-secundario">Sin receta configurada.</p>';
            return;
        }
        const esDirecto = ingredientes.length === 1 && ingredientes[0].tipo === 'producto_terminado';
        if (esDirecto) {
            body.innerHTML = `
                <div class="flex items-center gap-2 text-sm">
                    <ion-icon name="cube-outline" style="font-size:18px" class="text-primary"></ion-icon>
                    <span class="text-principal">Producto directo — <strong>${ingredientes[0].nombre}</strong></span>
                </div>`;
        } else {
            body.innerHTML = `
                <table class="w-full text-sm">
                    <thead><tr class="text-secundario uppercase text-xs tracking-wide border-b border-borde">
                        <th class="text-left py-2 pr-4">Ingrediente</th>
                        <th class="text-left py-2 pr-4">Cantidad</th>
                        <th class="text-left py-2">Unidad</th>
                    </tr></thead>
                    <tbody>
                        ${ingredientes.map(i => `
                            <tr class="border-b border-borde last:border-0">
                                <td class="py-2 pr-4 text-principal">${i.nombre}</td>
                                <td class="py-2 pr-4 text-secundario">${i.cantidad}</td>
                                <td class="py-2 text-secundario">${i.unidadMedida ?? '—'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
        }
    });

    Api.on('CREAR_PRODUCTO_MENU_RESPONSE', ({ success, mensaje }) => {
        const msg = document.getElementById('prod-msg');
        if (success) {
            msg.textContent = '✓ Producto creado correctamente';
            msg.className = 'text-sm text-green-600';
            msg.classList.remove('hidden');
            setTimeout(() => cerrarModalNuevoProducto(), 1500);
        } else {
            msg.textContent = mensaje ?? 'Error al crear el producto';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 4000);
        }
    });

    Api.on('NEW_PRODUCTO', ({ id, nombre, precio, categoriaId }) => {
        if (window._productosAdmin) {
            const cat = (window._categoriasAdmin ?? []).find(c => c.id === categoriaId);
            window._productosAdmin = [...window._productosAdmin, {
                id, nombre, precio, disponible: true, activo: true,
                categoria: cat?.nombre ?? '—', categoriaId
            }];
            filtrarProductos(null);
        }
    });

    Api.on('PRODUCTO_ACTIVO_UPDATED', ({ id, activo }) => {
        if (window._productosAdmin) {
            window._productosAdmin = window._productosAdmin.map(p => p.id === id ? { ...p, activo } : p);
            filtrarProductos(null);
        }
    });

    Api.on('PRECIO_PRODUCTO_UPDATED', ({ id, precio }) => {
        if (window._productosAdmin) {
            window._productosAdmin = window._productosAdmin.map(p => p.id === id ? { ...p, precio } : p);
            filtrarProductos(null);
        }
        cerrarModalPrecioProducto();
    });

    Api.on('CREAR_INGREDIENTE_RESPONSE', ({ success, mensaje }) => {
        const msg = document.getElementById('ing-msg');
        if (success) {
            msg.textContent = '✓ Ingrediente creado y sincronizado con Odoo';
            msg.className = 'text-sm text-green-600';
            msg.classList.remove('hidden');
            setTimeout(() => cerrarModalIngrediente(), 1500);
        } else {
            msg.textContent = mensaje ?? 'Error al crear el ingrediente';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 4000);
        }
    });

    Api.on('CREAR_CATEGORIA_RESPONSE', ({ success, mensaje }) => {
        const msg = document.getElementById('crear-categoria-msg');
        if (success) {
            document.getElementById('nueva-categoria-nombre').value = '';
            Api.getCategoriasAdmin();
            msg.textContent = '✓ Categoría creada correctamente';
            msg.className = 'text-sm text-green-600';
            msg.classList.remove('hidden');
            setTimeout(() => cerrarModalCategoria(), 1500);
        } else {
            msg.textContent = mensaje ?? 'Error al crear la categoría';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
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
    Api.on('CREAR_MESA_RESPONSE', ({ success, mensaje }) => {
        if (!success) {
            const msg = document.getElementById('nueva-mesa-msg');
            msg.textContent = mensaje ?? 'Error: el número de mesa ya existe';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 4000);
        }
    });

    Api.on('NEW_MESA', ({ id, numero, capacidad, estado }) => {
        if (window._mesasAdmin) {
            window._mesasAdmin = [...window._mesasAdmin, { id, numero, capacidad, estado }];
            _renderMesas(window._mesasAdmin);
        }
        cerrarModalNuevaMesa();
    });

    Api.on('MESA_CAPACIDAD_UPDATED', ({ id, capacidad }) => {
        if (window._mesasAdmin) {
            window._mesasAdmin = window._mesasAdmin.map(m => m.id === id ? { ...m, capacidad } : m);
            _renderMesas(window._mesasAdmin);
        }
        cerrarModalCapacidad();
    });

    Api.on('MESA_UPDATED', ({ id, estado }) => {
        if (window._mesasAdmin) {
            window._mesasAdmin = window._mesasAdmin.map(m => m.id === id ? { ...m, estado } : m);
            _renderMesas(window._mesasAdmin);
        } else {
            Api.getMesas();
        }
    });

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
        RETIRADA:  ['Retirada',  'primary'],
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
let _sumarStockId = null;

function abrirModalSumarStock(id, nombre, stockActual, unidad) {
    _sumarStockId = id;
    const esUnidad = (unidad ?? '').toUpperCase() === 'UNIDAD';
    document.getElementById('sumar-stock-titulo').textContent = `${nombre} — stock actual: ${stockActual} ${unidad ?? ''}`;
    const input = document.getElementById('sumar-stock-cantidad');
    input.value = '';
    input.step = esUnidad ? '1' : '0.01';
    input.placeholder = esUnidad ? 'Ej: 10' : 'Ej: 2.5';
    document.getElementById('sumar-stock-msg').classList.add('hidden');
    const modal = document.getElementById('modal-sumar-stock');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalSumarStock() {
    _sumarStockId = null;
    const modal = document.getElementById('modal-sumar-stock');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitSumarStock() {
    const cantidad = parseFloat(document.getElementById('sumar-stock-cantidad').value);
    const msg = document.getElementById('sumar-stock-msg');
    const esUnidad = document.getElementById('sumar-stock-cantidad').step === '1';
    if (isNaN(cantidad) || cantidad <= 0) {
        msg.textContent = 'Introduce una cantidad mayor que 0';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    if (esUnidad && !Number.isInteger(cantidad)) {
        msg.textContent = 'Este ingrediente se mide en unidades enteras';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.sumarStock(_sumarStockId, cantidad);
    cerrarModalSumarStock();
}

// --- Modal Nuevo Producto ---
let _recetaActual = [];

function verRecetaProducto(id, nombre) {
    document.getElementById('modal-receta-titulo').textContent = `Receta — ${nombre}`;
    document.getElementById('modal-receta-body').innerHTML = '<p class="text-sm text-secundario">Cargando...</p>';
    const modal = document.getElementById('modal-receta');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    Api.getRecetaProducto(id);
}

function cerrarModalReceta() {
    const modal = document.getElementById('modal-receta');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function abrirModalNuevoProducto() {
    _recetaActual = [];
    ['prod-nombre', 'prod-precio', 'prod-cat-input', 'prod-stock', 'receta-ing-input', 'receta-cantidad'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('prod-cat-id').value = '';
    document.getElementById('receta-ing-id').value = '';
    document.getElementById('prod-directo').checked = false;
    document.getElementById('toggle-bg').style.backgroundColor = '';
    document.getElementById('toggle-dot').style.transform = '';
    document.getElementById('section-stock').classList.add('hidden');
    document.getElementById('section-receta').classList.remove('hidden');
    document.getElementById('receta-lista').innerHTML = '';
    document.getElementById('prod-msg').classList.add('hidden');
    document.getElementById('prod-cat-dropdown').classList.add('hidden');
    document.getElementById('receta-ing-dropdown').classList.add('hidden');
    const modal = document.getElementById('modal-nuevo-producto');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalNuevoProducto() {
    _recetaActual = [];
    const modal = document.getElementById('modal-nuevo-producto');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function toggleProductoDirecto() {
    const checked = document.getElementById('prod-directo').checked;
    document.getElementById('toggle-bg').style.backgroundColor = checked ? '#3D64F4' : '';
    document.getElementById('toggle-dot').style.transform = checked ? 'translateX(20px)' : '';
    document.getElementById('section-stock').classList.toggle('hidden', !checked);
    document.getElementById('section-receta').classList.toggle('hidden', checked);
}

function filtrarCategorias() {
    const val = document.getElementById('prod-cat-input').value.toLowerCase();
    const cats = (window._categoriasAdmin ?? []).filter(c => c.nombre.toLowerCase().includes(val));
    const dd = document.getElementById('prod-cat-dropdown');
    if (!cats.length) { dd.classList.add('hidden'); return; }
    dd.innerHTML = cats.map(c => `
        <div onclick="seleccionarCategoria(${c.id}, '${c.nombre}')"
            class="px-4 py-2 text-sm text-principal hover:bg-fondo cursor-pointer">${c.nombre}</div>
    `).join('');
    dd.classList.remove('hidden');
}

function seleccionarCategoria(id, nombre) {
    document.getElementById('prod-cat-input').value = nombre;
    document.getElementById('prod-cat-id').value = id;
    document.getElementById('prod-cat-dropdown').classList.add('hidden');
}

function filtrarIngredientesReceta() {
    const val = document.getElementById('receta-ing-input').value.toLowerCase();
    // Solo ingredientes que NO sean producto_terminado
    const ings = (window._ingredientesAdmin ?? [])
        .filter(i => i.tipoIngrediente?.toUpperCase() !== 'PRODUCTO_TERMINADO' && i.nombre.toLowerCase().includes(val));
    const dd = document.getElementById('receta-ing-dropdown');
    if (!ings.length) { dd.classList.add('hidden'); return; }
    dd.innerHTML = ings.map(i => `
        <div onclick="seleccionarIngredienteReceta(${i.id}, '${i.nombre}')"
            class="px-4 py-2 text-sm text-principal hover:bg-fondo cursor-pointer">${i.nombre}</div>
    `).join('');
    dd.classList.remove('hidden');
}

function seleccionarIngredienteReceta(id, nombre) {
    document.getElementById('receta-ing-input').value = nombre;
    document.getElementById('receta-ing-id').value = id;
    document.getElementById('receta-ing-dropdown').classList.add('hidden');
}

function addIngredienteReceta() {
    const id       = parseInt(document.getElementById('receta-ing-id').value);
    const nombre   = document.getElementById('receta-ing-input').value.trim();
    const cantidad = parseFloat(document.getElementById('receta-cantidad').value);
    if (!id || !nombre || isNaN(cantidad) || cantidad <= 0) return;
    if (_recetaActual.find(r => r.ingredienteId === id)) return; // no duplicados
    _recetaActual.push({ ingredienteId: id, nombre, cantidad });
    document.getElementById('receta-ing-input').value = '';
    document.getElementById('receta-ing-id').value = '';
    document.getElementById('receta-cantidad').value = '';
    _renderRecetaLista();
}

function _renderRecetaLista() {
    document.getElementById('receta-lista').innerHTML = _recetaActual.map((r, i) => `
        <div class="flex items-center justify-between px-3 py-1.5 bg-fondo rounded-lg text-sm">
            <span class="text-principal">${r.nombre}</span>
            <div class="flex items-center gap-2">
                <span class="text-secundario">${r.cantidad}</span>
                <button onclick="_removeIngredienteReceta(${i})" class="text-error hover:opacity-70">
                    <ion-icon name="close-outline" style="font-size:14px"></ion-icon>
                </button>
            </div>
        </div>
    `).join('');
}

function _removeIngredienteReceta(index) {
    _recetaActual.splice(index, 1);
    _renderRecetaLista();
}

function submitNuevoProducto() {
    const nombre    = document.getElementById('prod-nombre').value.trim();
    const precio    = parseFloat(document.getElementById('prod-precio').value);
    const catId     = parseInt(document.getElementById('prod-cat-id').value);
    const esDirecto = document.getElementById('prod-directo').checked;
    const msg       = document.getElementById('prod-msg');

    if (!nombre || isNaN(precio) || precio <= 0 || !catId) {
        msg.textContent = 'Rellena nombre, precio y categoría correctamente';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }

    const payload = { nombre, precio, categoriaId: catId, esProductoDirecto: esDirecto };

    if (esDirecto) {
        const stock = parseInt(document.getElementById('prod-stock').value);
        if (isNaN(stock) || stock < 1) {
            msg.textContent = 'Introduce el stock inicial';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
            return;
        }
        payload.stockInicial = stock;
    } else {
        if (_recetaActual.length === 0) {
            msg.textContent = 'Añade al menos un ingrediente a la receta';
            msg.className = 'text-sm text-error';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
            return;
        }
        payload.receta = _recetaActual.map(r => ({ ingredienteId: r.ingredienteId, cantidad: r.cantidad }));
    }

    Api.crearProductoMenu(payload);
}

function abrirModalIngrediente() {
    ['ing-nombre', 'ing-stock'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ing-unidad').value = 'unidades';
    document.getElementById('ing-msg').classList.add('hidden');
    const modal = document.getElementById('modal-ingrediente');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalIngrediente() {
    const modal = document.getElementById('modal-ingrediente');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitIngrediente() {
    const nombre = document.getElementById('ing-nombre').value.trim();
    const stock  = parseFloat(document.getElementById('ing-stock').value);
    const unidad = document.getElementById('ing-unidad').value;
    const tipo   = 'materia_prima';
    const msg     = document.getElementById('ing-msg');
    if (!nombre || isNaN(stock) || stock < 0) {
        msg.textContent = 'Rellena todos los campos correctamente';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.crearIngrediente(nombre, stock, unidad, tipo);
}

function abrirModalCategoria() {
    document.getElementById('nueva-categoria-nombre').value = '';
    document.getElementById('crear-categoria-msg').classList.add('hidden');
    const modal = document.getElementById('modal-categoria');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalCategoria() {
    const modal = document.getElementById('modal-categoria');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitCrearCategoria() {
    const nombre = document.getElementById('nueva-categoria-nombre').value.trim();
    if (!nombre) {
        const msg = document.getElementById('crear-categoria-msg');
        msg.textContent = 'Introduce el nombre de la categoría';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.crearCategoria(nombre);
}

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

function _renderMesas(mesas) {
    const tbody = document.getElementById('tabla-mesas');
    if (!mesas.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-secundario text-sm">Sin mesas</td></tr>';
        return;
    }
    tbody.innerHTML = mesas.map(m => {
        let boton = '';
        if (m.estado === 'LIBRE') {
            boton = `<button onclick="toggleRetirarMesa(${m.id}, 'RETIRADA')"
                class="text-xs text-secundario border border-borde px-3 py-1 rounded-lg hover:bg-fondo transition-colors">
                Retirar
            </button>`;
        } else if (m.estado === 'RETIRADA') {
            boton = `<button onclick="toggleRetirarMesa(${m.id}, 'LIBRE')"
                class="text-xs text-green-600 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">
                Activar
            </button>`;
        }
        return `
            <tr class="hover:bg-fondo transition-colors">
                <td class="px-4 py-3 text-principal font-medium">${m.numero}</td>
                <td class="px-4 py-3 text-secundario">
                    <span class="font-medium text-principal">${m.capacidad}</span>
                    <span class="text-secundario"> personas</span>
                    <button onclick="abrirModalCapacidad(${m.id}, ${m.capacidad})"
                        class="ml-2 inline-flex items-center gap-1 text-xs text-secundario border border-borde px-2 py-0.5 rounded-md hover:border-primary hover:text-primary transition-colors">
                        <ion-icon name="pencil-outline" style="font-size:12px"></ion-icon>
                        Editar
                    </button>
                </td>
                <td class="px-4 py-3">${_badgeEstadoMesa(m.estado)}</td>
                <td class="px-4 py-3 text-right">${boton}</td>
            </tr>
        `;
    }).join('');
}

function abrirModalNuevaMesa() {
    document.getElementById('nueva-mesa-numero').value = '';
    document.getElementById('nueva-mesa-capacidad').value = '';
    document.getElementById('nueva-mesa-msg').classList.add('hidden');
    const modal = document.getElementById('modal-nueva-mesa');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalNuevaMesa() {
    const modal = document.getElementById('modal-nueva-mesa');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitNuevaMesa() {
    const numero = parseInt(document.getElementById('nueva-mesa-numero').value, 10);
    const capacidad = parseInt(document.getElementById('nueva-mesa-capacidad').value, 10);
    const msg = document.getElementById('nueva-mesa-msg');
    if (isNaN(numero) || numero < 1 || isNaN(capacidad) || capacidad < 1 || capacidad > 99) {
        msg.textContent = 'Introduce un número de mesa válido y una capacidad entre 1 y 99';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.sendMessage('CREAR_MESA', { numero, capacidad });
}

let _capacidadMesaId = null;

function abrirModalCapacidad(id, capacidadActual) {
    _capacidadMesaId = id;
    document.getElementById('modal-capacidad-titulo').textContent = `Mesa ID: ${id} — capacidad actual: ${capacidadActual} personas`;
    document.getElementById('nueva-capacidad').value = capacidadActual;
    document.getElementById('capacidad-msg').classList.add('hidden');
    const modal = document.getElementById('modal-capacidad');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalCapacidad() {
    _capacidadMesaId = null;
    const modal = document.getElementById('modal-capacidad');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitCapacidad() {
    const val = parseInt(document.getElementById('nueva-capacidad').value, 10);
    const msg = document.getElementById('capacidad-msg');
    if (isNaN(val) || val < 1 || val > 99) {
        msg.textContent = 'Introduce un valor entre 1 y 99';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.sendMessage('ACTUALIZAR_CAPACIDAD_MESA', { id: _capacidadMesaId, capacidad: val });
}

function toggleRetirarMesa(id, nuevoEstado) {
    Api.sendMessage('UPDATE_MESA_STATUS', { id, estado: nuevoEstado });
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
    if (estado !== null) {
        document.querySelectorAll('#filtros-estado-pedido .filtro-cat-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`filtro-pedido-${estado}`)?.classList.add('active');
    }
    const estadoActivo = document.querySelector('#filtros-estado-pedido .filtro-cat-btn.active')?.id?.replace('filtro-pedido-', '') ?? 'TODOS';
    const fechaVal = document.getElementById('filtro-fecha-pedido')?.value;

    const todos = window._pedidosAdmin ?? [];
    const filtrados = todos.filter(p => {
        const coincideEstado = estadoActivo === 'TODOS' || p.estado?.toUpperCase() === estadoActivo;
        if (!fechaVal) return coincideEstado;
        if (!p.fechaCreacion) return false;
        const d = new Date(p.fechaCreacion);
        const fechaPedido = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return coincideEstado && fechaPedido === fechaVal;
    });
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
                        <th class="text-left py-1 pr-4">Precio ud.</th>
                        <th class="text-left py-1 pr-4">Subtotal</th>
                        <th class="text-left py-1 pr-4">Estado</th>
                        <th class="text-left py-1">Notas</th>
                    </tr></thead>
                    <tbody>
                        ${(p.detalles ?? []).map(d => `
                            <tr data-detalle-id="${d.id}">
                                <td class="py-1 pr-4 text-principal">${d.nombreProducto}</td>
                                <td class="py-1 pr-4 text-secundario">${d.cantidad}</td>
                                <td class="py-1 pr-4 text-secundario">${d.precioUnitario != null ? d.precioUnitario.toFixed(2) + ' €' : '—'}</td>
                                <td class="py-1 pr-4 text-principal font-medium">${d.precioUnitario != null ? (d.precioUnitario * d.cantidad).toFixed(2) + ' €' : '—'}</td>
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
        <tr class="hover:bg-fondo transition-colors ${p.activo === false ? 'opacity-50' : ''}">
            <td class="px-4 py-3 text-principal font-medium">${p.id}</td>
            <td class="px-4 py-3 text-principal">${p.nombre}</td>
            <td class="px-4 py-3 text-secundario">${p.categoria}</td>
            <td class="px-4 py-3 text-principal">${p.precio.toFixed(2)} €</td>
            <td class="px-4 py-3">${p.disponible ? _badge('Disponible', 'success') : _badge('No disponible', 'error')}</td>
            <td class="px-4 py-3 text-right flex items-center justify-end gap-2">
                ${p.activo !== false
                    ? `<button onclick="Api.toggleProductoActivo(${p.id}, false)"
                        class="inline-flex items-center gap-1 text-xs text-warning border border-yellow-200 px-3 py-1 rounded-lg hover:bg-yellow-50 transition-colors">
                        <ion-icon name="eye-off-outline" style="font-size:12px"></ion-icon>
                        Desactivar
                       </button>`
                    : `<button onclick="Api.toggleProductoActivo(${p.id}, true)"
                        class="inline-flex items-center gap-1 text-xs text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">
                        <ion-icon name="eye-outline" style="font-size:12px"></ion-icon>
                        Activar
                       </button>`
                }
                <button onclick="abrirModalPrecioProducto(${p.id}, '${p.nombre}', ${p.precio})"
                    class="inline-flex items-center gap-1 text-xs text-secundario border border-borde px-3 py-1 rounded-lg hover:bg-fondo transition-colors">
                    <ion-icon name="pencil-outline" style="font-size:12px"></ion-icon>
                    Precio
                </button>
                <button onclick="verRecetaProducto(${p.id}, '${p.nombre}')"
                    class="inline-flex items-center gap-1 text-xs text-primary border border-primary/30 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors">
                    <ion-icon name="list-outline" style="font-size:12px"></ion-icon>
                    Receta
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" class="px-4 py-8 text-center text-secundario text-sm">Sin productos</td></tr>';
}

// --- Modal Editar Precio Producto ---

let _precioProductoId = null;

function abrirModalPrecioProducto(id, nombre, precioActual) {
    _precioProductoId = id;
    document.getElementById('modal-precio-titulo').textContent = `${nombre} — precio actual: ${precioActual.toFixed(2)} €`;
    document.getElementById('nuevo-precio-producto').value = precioActual.toFixed(2);
    document.getElementById('precio-producto-msg').classList.add('hidden');
    const modal = document.getElementById('modal-precio-producto');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalPrecioProducto() {
    _precioProductoId = null;
    const modal = document.getElementById('modal-precio-producto');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function submitPrecioProducto() {
    const precio = parseFloat(document.getElementById('nuevo-precio-producto').value);
    const msg = document.getElementById('precio-producto-msg');
    if (isNaN(precio) || precio <= 0) {
        msg.textContent = 'Introduce un precio mayor que 0';
        msg.className = 'text-sm text-error';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
    Api.actualizarPrecioProducto(_precioProductoId, precio);
}

// --- Lógica de pedidos ---

// Expande o colapsa la sub-tabla de detalles de un pedido al hacer click en su fila
function toggleDetalles(pedidoId) {
    const fila = document.getElementById(`detalles-${pedidoId}`);
    fila?.classList.toggle('hidden');
}