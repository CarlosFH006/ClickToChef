import { Ionicons } from "@expo/vector-icons";
import { Pressable, PressableProps, Text } from "react-native";

interface Props extends PressableProps {
    children: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'principal' | 'info' | 'success' | 'warning' | 'error';
    className?: string; // añadido className para que soporte inyección de estilos tailwind
}

const ThemedButton = ({ children, icon, variant = 'principal', className = '', ...rest }: Props) => {
    
    // Mapeamos los variantes a los colores de fondo de tailwind.config.js
    const bgColors = {
        principal: 'bg-principal',
        info: 'bg-info',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
    }
    
    const bgColor = bgColors[variant] || 'bg-principal';

    return (
        <Pressable
            className={`${bgColor} active:opacity-80 px-4 py-4 rounded-md items-center flex-row justify-center ${className}`}
            {...rest}
        >
            <Text className="text-superficie font-cuerpo font-semibold">{children}</Text>
            {icon && (
                <Ionicons
                    name={icon}
                    size={24}
                    color='white'
                    style={{ marginHorizontal: 10 }}
                />
            )}
        </Pressable>
    )
}

export default ThemedButton;