import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@sarangi/ui-tokens';
import { CartProvider } from '../src/context/cart-context';
import { AuthProvider } from '../src/context/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.neutral[50] },
            headerTintColor: colors.brand.primary,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.neutral[50] },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[slug]"
            options={{ title: 'Product', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="checkout/index"
            options={{ title: 'Checkout', headerBackTitle: 'Bag' }}
          />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
