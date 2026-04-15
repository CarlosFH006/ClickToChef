import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, LogBox } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import '../global.css';

// Evita que la SplashScreen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

LogBox.ignoreAllLogs(true);

export default function RootLayout() {


  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    'OpenSans-Bold': require('../assets/font/OpenSans-Bold.ttf'),
    'OpenSans-Regular': require('../assets/font/OpenSans-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-fondo">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          headerShown: false
        }}>

        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
