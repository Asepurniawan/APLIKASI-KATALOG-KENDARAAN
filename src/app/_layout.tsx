import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const segment = segments[0];
    const isPublicRoute = segment === 'login' || segment === 'register';

    if (!session && !isPublicRoute) {
      router.replace('/login');
    } else if (session && isPublicRoute) {
      router.replace('/');
    }
  }, [isLoading, router, session, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="users" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      )}
    </ThemeProvider>
  );
}
