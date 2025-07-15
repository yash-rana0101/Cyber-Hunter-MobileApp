import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import PreloaderScreen from '../components/PreloaderScreen';
import { Colors } from '../constants/Colors';
import { AppProviders } from '../context/AppProviders';

const AppContent: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Show preloader for at least 2 seconds after fonts are loaded
    if (loaded) {
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (showPreloader) {
    return <PreloaderScreen onFinish={() => setShowPreloader(false)} />;
  }

  return (
    <AppProviders>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
        <AppContent />
        <StatusBar style="light" backgroundColor={Colors.background} translucent={false} />
      </GestureHandlerRootView>
    </AppProviders>
  );
}
