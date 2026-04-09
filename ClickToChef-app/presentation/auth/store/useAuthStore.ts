import { create } from 'zustand';
import { Usuario } from '../../../type/usuario-interface';
import { authLogin } from '../../../core/actions/login-action';
import { SecureStorage } from '../../../helpers/adapters/secure-storage';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export interface AuthState {
    status: AuthStatus;
    user?: Usuario;

    // Acciones de estado
    login: (username: string, pass: string) => Promise<boolean>;
    changeStatus: (user?: Usuario, pass?: string) => Promise<void>;
    checkStatus: () => Promise<void>; // <-- Añadida a la interfaz
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    status: 'unauthenticated',
    user: undefined,

    login: async (username: string, pass: string) => {
        set({ status: 'checking' });
        return await authLogin(username, pass);
    },

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

    checkStatus: async () => {
        try {
            const session = await SecureStorage.getItem('user_session');
            
            if (!session) {
                set({ status: 'unauthenticated', user: undefined });
                return;
            }

            // Si existe la sesión, parseamos los datos
            const { user } = JSON.parse(session);
            
            // Aquí podrías disparar una validación silenciosa con el Socket si quisieras,
            // pero para el RA2, con restaurar el estado local es suficiente.
            set({ status: 'authenticated', user: user });

        } catch (error) {
            console.error("Error al verificar la sesión persistente", error);
            set({ status: 'unauthenticated', user: undefined });
        }
    },

    logout: async () => {
        await SecureStorage.deleteItem('user_session');
        set({ status: "unauthenticated", user: undefined });
    }
}));