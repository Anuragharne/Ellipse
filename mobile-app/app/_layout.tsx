import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useAuthStore } from '../src/stores/auth.store';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

const EllipseTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.lime,
    background: colors.forest,
    card: colors.surfaceElevated,
    text: colors.white,
    border: colors.teal,
    notification: colors.severityCritical,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Philosopher-Regular': require('../assets/fonts/Philosopher-Regular.ttf'),
    'Philosopher-Bold': require('../assets/fonts/Philosopher-Bold.ttf'),
  });

  const { isLoading, token, isFirstLaunch, restoreToken } = useAuthStore();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { token, isFirstLaunch } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    const timer = setTimeout(() => {
      if (isFirstLaunch && !inOnboarding) {
        router.replace('/onboarding');
      } else if (!isFirstLaunch && !token && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (token && (inAuthGroup || inOnboarding)) {
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [token, isFirstLaunch, segments]);

  return (
    <ThemeProvider value={EllipseTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.forest } }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
