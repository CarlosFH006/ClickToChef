import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

const LogOutIconButton = () => {
    const { logout } = useAuthStore();

    return (
        <TouchableOpacity className="mr-2" onPress={logout}>
            <Ionicons name='log-out-outline' size={24} color={Colors.light.primary} />
        </TouchableOpacity>
    )
}

export default LogOutIconButton
