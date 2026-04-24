document.addEventListener('DOMContentLoaded', () => {
    //Conectar al websocket
    WebSocketService.connect();

    //Obtener elementos del DOM
    const btnLogin       = document.getElementById('btn-login');
    const inputUsuario   = document.getElementById('usuario');
    const inputContrasena = document.getElementById('contrasena');

    //Comprobar los inputs para habilitar o deshabilitar el boton
    function checkInputs() {
        //Si los inputs estan vacios, deshabilitar el boton, si no, habilitarlo
        btnLogin.disabled = inputUsuario.value.trim() === '' || inputContrasena.value.trim() === '';
    }
    //Agregar eventos a los campos
    inputUsuario.addEventListener('input', checkInputs);
    inputContrasena.addEventListener('input', checkInputs);
    
    //Enviar con Enter
    [inputUsuario, inputContrasena].forEach(el => {
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    });
    //Agregar evento al boton
    btnLogin.addEventListener('click', login);

    //Gestionar la respuesta del login
    Api.on('LOGIN_RESPONSE', (payload) => {
        //Si el login es exitoso
        if (payload.success) {
            const user = payload.user;
            //Redirigir al usuario a la página correspondiente según su rol
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

    // Almacenar el indentificador de los elementos del DOM
    const inputs = [
        ['wrap-usuario',    'icon-usuario'],
        ['wrap-contrasena', 'icon-contrasena'],
    ];

    //Aplicar estilos a los elementos anteriores
    inputs.forEach(([wrapId, iconId]) => {
        //Obtener los elementos del DOM
        const wrapEl = document.getElementById(wrapId);
        const iconEl = document.getElementById(iconId);
        const input  = wrapEl.querySelector('input');

        //Verificar que los elementos del DOM existan
        if (wrapEl && iconEl && input) {
            //Agregar eventos a los campos
            //Al tener el foco, cambiar el borde de los inputs
            input.addEventListener('focus', () => {
                wrapEl.classList.replace('border-borde',    'border-primary');
                iconEl.classList.replace('text-secundario', 'text-primary');
            });
            //Al perder el foco, devolver el borde a su estado original
            input.addEventListener('blur', () => {
                wrapEl.classList.replace('border-primary',  'border-borde');
                iconEl.classList.replace('text-primary',    'text-secundario');
            });
        }
    });
});

function login() {
    //Obtener los valores de los inputs
    const usuario    = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    //Comprobar si los inputs estan vacios
    if (!usuario || !contrasena) {
        alert('Por favor, complete todos los campos');
        return;
    }

    //Enviar los datos al servidor, si falla la conexión, mostrar un mensaje
    if (!Api.login(usuario, contrasena)) {
        alert('Error de conexión: No se pudo contactar con el servidor. Por favor, compruebe su conexión e inténtelo de nuevo.');
    }
}
