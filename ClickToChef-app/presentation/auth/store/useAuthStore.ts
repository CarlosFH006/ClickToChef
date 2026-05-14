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

    //Iniciar sesión, se establece el estado como checking mientras se lanza la petición de login al servidor
    login: async (username: string, pass: string) => {
        set({ status: 'checking' });
        return await authLogin(username, pass);
    },

    //Acción para cambiar el estado de autenticación, SocketClient la llama, cuando 
    changeStatus: async (user?: Usuario, pass?: string) => {
        if (!user) {
            set({ status: 'unauthenticated', user: undefined });
            await SecureStorage.deleteItem('user_session');
            return;
        }

        set({ status: 'authenticated', user });
        // Guardamos tanto el objeto usuario para crear la sesión persistente
        await SecureStorage.setItem('user_session', JSON.stringify({ user, pass }));
    },

    //Verifica si existe una sesión persistente y establece el estado de autenticación.
    checkStatus: async () => {
        try {
            //Verifica si existe una sesión persistente
            const session = await SecureStorage.getItem('user_session');

            //Si no existe una sesión persistente, establece el estado como unauthenticated
            if (!session) {
                set({ status: 'unauthenticated', user: undefined });
                return;
            }

            //Si existe la sesión, parseamos los datos
            const { user } = JSON.parse(session);

            //Establece el estado como authenticated
            set({ status: 'authenticated', user: user });

        } catch (error) {
            console.error("Error al verificar la sesión persistente", error);
            set({ status: 'unauthenticated', user: undefined });
        }
    },

    //Cerrar sesión, elimina la sesión persistente y establece el estado como unauthenticated
    logout: async () => {
        await SecureStorage.deleteItem('user_session');
        set({ status: "unauthenticated", user: undefined });
    }
}));