import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { colors } from '@sarangi/ui-tokens';
import { useCart } from '../../src/context/cart-context';

function BagTabIcon({ color }: { color: string }) {
  const { cart } = useCart();
  return (
    <View>
      <Text style={{ fontSize: 20, color }}>🛍️</Text>
      {cart.itemCount > 0 ? (
        <View
          style={{
            position: 'absolute',
            right: -10,
            top: -5,
            backgroundColor: colors.brand.accent,
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: colors.brand.primary,
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: '800', color: colors.brand.primary }}>
            {cart.itemCount > 9 ? '9+' : cart.itemCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand.accent,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.45)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: -2,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.brand.primary,
          borderTopColor: 'rgba(212, 175, 55, 0.15)',
          borderTopWidth: 1,
          height: 60,
          paddingTop: 4,
          paddingBottom: 4,
        },
        headerStyle: {
          backgroundColor: colors.brand.primary,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(212, 175, 55, 0.15)',
        },
        headerTintColor: colors.brand.accent,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💎</Text>,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color }) => <BagTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>❤️</Text>,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}

