document.addEventListener('DOMContentLoaded', () => {
    WebSocketService.connect();

    const btnLogin       = document.getElementById('btn-login');
    const inputUsuario   = document.getElementById('usuario');
    const inputContrasena = document.getElementById('contrasena');

    // Habilitar botón solo cuando ambos campos tienen texto
    function checkInputs() {
        btnLogin.disabled = inputUsuario.value.trim() === '' || inputContrasena.value.trim() === '';
    }
    inputUsuario.addEventListener('input', checkInputs);
    inputContrasena.addEventListener('input', checkInputs);

    // Enviar con Enter
    [inputUsuario, inputContrasena].forEach(el => {
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    });

    btnLogin.addEventListener('click', login);

    Api.on('LOGIN_RESPONSE', (payload) => {
        if (payload.success) {
            const user = payload.user;
            localStorage.setItem('user', JSON.stringify(user));

            if (user.rol === 'CAMARERO') {
                alert('El camarero no puede acceder a esta página');
            } else if (user.rol === 'COCINERO') {
                window.location.href = 'kanban.html';
            } else if (user.rol === 'ADMIN') {
                window.location.href = 'admin.html';
            }
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    // Efectos de foco en los campos
    const inputs = [
        ['wrap-usuario',    'icon-usuario'],
        ['wrap-contrasena', 'icon-contrasena'],
    ];

    inputs.forEach(([wrapId, iconId]) => {
        const wrapEl = document.getElementById(wrapId);
        const iconEl = document.getElementById(iconId);
        const input  = wrapEl.querySelector('input');

        if (wrapEl && iconEl && input) {
            input.addEventListener('focus', () => {
                wrapEl.classList.replace('border-borde',    'border-primary');
                iconEl.classList.replace('text-secundario', 'text-primary');
            });
            input.addEventListener('blur', () => {
                wrapEl.classList.replace('border-primary',  'border-borde');
                iconEl.classList.replace('text-primary',    'text-secundario');
            });
        }
    });
});

function login() {
    const usuario    = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    if (!usuario || !contrasena) {
        alert('Por favor, complete todos los campos');
        return;
    }

    if (!Api.login(usuario, contrasena)) {
        alert('Error de conexión: No se pudo contactar con el servidor. Por favor, compruebe su conexión e inténtelo de nuevo.');
    }
}
