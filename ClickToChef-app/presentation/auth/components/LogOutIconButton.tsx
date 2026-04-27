import React from 'react'
import { useAuthStore } from '../store/useAuthStore';
import ThemedButton from '../../theme/components/ThemedButton';

//Botón para cerrar sesión
const LogOutIconButton = () => {
    const { logout } = useAuthStore();

    return (
        <ThemedButton
            icon="log-out-outline"
            variant="error"
            className="mr-2 px-3 py-2"
            onPress={logout}
        >
            Salir
        </ThemedButton>
    )
}

export default LogOutIconButton
