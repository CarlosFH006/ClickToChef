import { View, Text, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../theme/hooks/use-theme-color';

const LogOutIconButton = () => {
    const primaryColor = useThemeColor({}, 'primary');
    const { logout } = useAuthStore();

    return (
        <TouchableOpacity style={{marginRight: 8}}
        onPress={logout}
        >
            <Ionicons name='log-out-outline' size={24} color={primaryColor}/>
        </TouchableOpacity>
    )
}

export default LogOutIconButton