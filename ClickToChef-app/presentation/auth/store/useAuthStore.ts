import { create } from 'zustand';
import { authLogin } from '../../../core/actions/login-action';
import { SecureStorage } from '../../../helpers/adapters/secure-storage';
import { Usuario } from '../../../type/usuario-interface';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export interface AuthState {
    status: AuthStatus;
    user?: Usuario;

    // Acciones de estado
    login: (username: string, pass: string) => Promise<boolean>;
    changeStatus: (user?: Usuario, pass?: string) => Promise<void>;
    checkStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    status: 'checking',
    user: undefined,

    //Acción para iniciar sesión
    /*
        El estado se cambia a authenticated cuando en el SocketClient se recibe un mensaje de tipo LOGIN_SUCCESS
        y se guarda el usuario en el estado.
        Si el login falla o el usuario no es camarero, el estado cambia a unauthenticated.
    */
    login: async (username: string, pass: string) => {
        set({ status: 'checking' });
        return await authLogin(username, pass);
    },

    //Acción para cambiar el estado de autenticación
    /*
        Si no se proporciona usuario, se establece el estado como unauthenticated y se elimina la sesión.
        Si se proporciona usuario, se establece el estado como authenticated y se guarda la sesión.
    */
    changeStatus: async (user?: Usuario, pass?: string) => {
        if (!user) {
            set({ status: 'unauthenticated', user: undefined });
            await SecureStorage.deleteItem('user_session');
            return;
        }

        set({ status: 'authenticated', user });
        // Guardamos tanto el objeto usuario como el pass (opcional) para re-logueos asíncronos
        await SecureStorage.setItem('user_session', JSON.stringify({ user, pass }));
    },

    //Acción para verificar el estado de autenticación
    /*
        Verifica si existe una sesión persistente y establece el estado de autenticación.
    */
    checkStatus: async () => {
        try {
            const session = await SecureStorage.getItem('user_session');

            if (!session) {
                set({ status: 'unauthenticated', user: undefined });
                return;
            }

            // Si existe la sesión, parseamos los datos
            const { user } = JSON.parse(session);

            set({ status: 'authenticated', user: user });

        } catch (error) {
            console.error("Error al verificar la sesión persistente", error);
            set({ status: 'unauthenticated', user: undefined });
        }
    },

    //Acción para cerrar sesión
    /*
        Elimina la sesión persistente y establece el estado como unauthenticated.
    */
    logout: async () => {
        await SecureStorage.deleteItem('user_session');
        set({ status: "unauthenticated", user: undefined });
    }
}));