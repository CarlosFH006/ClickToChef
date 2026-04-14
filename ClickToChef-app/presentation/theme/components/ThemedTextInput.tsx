import { View, TextInputProps, TextInput } from 'react-native'
import React, { useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

interface Props extends TextInputProps {
    icon?: keyof typeof Ionicons.glyphMap;
    className?: string;
}

const ThemedTextInput = ({ icon, className = '', ...rest }: Props) => {

    const [isActive, setisActive] = useState(false)

    const inputRef = useRef<TextInput>(null);

    return (
        <View
            className={`border rounded-2xl px-4 py-3 mb-3 flex-row items-center bg-superficie ${isActive ? 'border-primary' : 'border-borde'} ${className}`}
            onTouchStart={() => inputRef.current?.focus()}>
            {icon &&(
                <Ionicons
                name={icon}
                size={24}
                color={isActive ? '#3D64F4' : '#71717a'} // primary / secundario
                style={{marginRight: 10}}/>
            )}
            <TextInput {...rest}
            className="flex-1 font-cuerpo text-principal"
            ref={inputRef}
            placeholderTextColor='#71717a'
            onFocus={() => setisActive(true)}
            onBlur={() => setisActive(false)}/>
        </View>
  )
}

export default ThemedTextInput