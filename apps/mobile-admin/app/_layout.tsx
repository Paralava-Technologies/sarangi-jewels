import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@noeve/ui-tokens';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const token = await SecureStore.getItemAsync('noeve_admin_token');
      setIsReady(true);
      if (!token) {
        // Must use setImmediate or setTimeout to redirect outside of render cycle in expo-router
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      }
    }
    checkAuth();
  }, [router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[50] }}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#4A148C' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="index" options={{ title: 'Sarangi Jewels Admin' }} />
        <Stack.Screen name="orders" options={{ title: 'Orders' }} />
        <Stack.Screen name="fulfillment" options={{ title: 'Fulfillment' }} />
        <Stack.Screen name="scanner" options={{ title: 'Scan Label' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
