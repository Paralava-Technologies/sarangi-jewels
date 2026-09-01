import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, spacing } from '@sarangi/ui-tokens';
import { useAuth } from '../../src/context/auth-context';
import { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist, apiClient } from '../../src/lib/api';
import type { WishlistItem, Order } from '@sarangi/shared-types';
import { formatPrice } from '../../src/lib/format';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: '#92400E', bg: '#FEF3C7' },
  CONFIRMED:       { label: 'Confirmed',        color: '#065F46', bg: '#D1FAE5' },
  PROCESSING:      { label: 'Processing',        color: '#1E40AF', bg: '#DBEAFE' },
  SHIPPED:         { label: 'Shipped',           color: '#5B21B6', bg: '#EDE9FE' },
  DELIVERED:       { label: 'Delivered',         color: '#065F46', bg: '#D1FAE5' },
  CANCELLED:       { label: 'Cancelled',         color: '#991B1B', bg: '#FEE2E2' },
};

const perks = [
  { n: '01', title: 'Order tracking', desc: 'Follow delivery from warehouse to door.' },
  { n: '02', title: 'Saved addresses', desc: 'Faster checkout on repeat orders.' },
  { n: '03', title: 'Care reminders', desc: 'Keep your jewellery radiant longer.' },
];

export default function AccountScreen() {
  const { isAuthenticated, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getWishlist().then(setWishlist).catch(() => setWishlist([]));
      setOrdersLoading(true);
      apiClient.store.getOrders()
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    } else {
      setWishlist([]);
      setOrders([]);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      setError('');
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Account"
        title={isAuthenticated ? 'My Profile' : 'Welcome back'}
        subtitle={isAuthenticated ? 'Manage your orders and settings' : 'Sign in to track orders and manage your profile'}
      />

      {!isAuthenticated ? (
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="rgba(33, 29, 25, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(33, 29, 25, 0.4)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.btn} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.btnText}>{isLoading ? 'Signing in...' : 'Sign in'}</Text>
          </Pressable>
          <Text style={styles.hint}>Demo: customer@sarangi.local / Customer123!</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Signed in as Member</Text>
          <Pressable style={styles.btn} onPress={logout}>
            <Text style={styles.btnText}>Sign out</Text>
          </Pressable>
        </View>
      )}

      {/* ── Orders Section ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order history</Text>
        {isAuthenticated && orders.length > 0 && (
          <Text style={styles.sectionCount}>{orders.length} orders</Text>
        )}
      </View>

      {!isAuthenticated ? (
        <View style={styles.ordersCard}>
          <Text style={styles.ordersTitle}>Your orders</Text>
          <Text style={styles.ordersSub}>Sign in to view your order history.</Text>
          <Link href="/(tabs)/shop">
            <Text style={styles.ordersLink}>Start shopping →</Text>
          </Link>
        </View>
      ) : ordersLoading ? (
        <View style={styles.ordersLoadingBox}>
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.ordersEmptyCard}>
          <Text style={styles.ordersEmptyIcon}>✦</Text>
          <Text style={styles.ordersEmptyTitle}>No orders yet</Text>
          <Text style={styles.ordersEmptySub}>Your completed orders will appear here.</Text>
          <Link href="/(tabs)/shop" style={styles.ordersEmptyBtn}>
            <Text style={styles.ordersEmptyBtnText}>Start shopping</Text>
          </Link>
        </View>
      ) : (
        orders.map((order) => {
          const status = STATUS_LABELS[order.status] ?? { label: order.status, color: '#374151', bg: '#F3F4F6' };
          const isExpanded = expandedOrder === order.id;
          return (
            <Pressable
              key={order.id}
              style={styles.orderRow}
              onPress={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              <View style={styles.orderRowTop}>
                <View style={styles.orderRowLeft}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderMeta}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                    {order.lines ? ` · ${order.lines.length} item${order.lines.length !== 1 ? 's' : ''}` : ''}
                  </Text>
                </View>
                <View style={styles.orderRowRight}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  {order.totalCents != null && (
                    <Text style={styles.orderTotal}>
                      {formatPrice(order.totalCents, order.currency ?? 'INR')}
                    </Text>
                  )}
                </View>
              </View>
              {isExpanded && order.lines && order.lines.length > 0 && (
                <View style={styles.orderLines}>
                  {order.lines.map((line: any) => (
                    <View key={line.id} style={styles.orderLine}>
                      <Text style={styles.orderLineName} numberOfLines={1}>{line.productName}</Text>
                      <Text style={styles.orderLineQty}>×{line.quantity}</Text>
                      <Text style={styles.orderLinePrice}>
                        {formatPrice(line.lineTotalCents, line.currency ?? 'INR')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.expandCaret}>{isExpanded ? '▲' : '▼'}</Text>
            </Pressable>
          );
        })
      )}

      {/* ── Wishlist Section ── */}
      {isAuthenticated && (
        <View>
          <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionTitle}>Wishlist</Text>
            {wishlist.length > 0 && (
              <Text style={styles.sectionCount}>{wishlist.length} saved</Text>
            )}
          </View>
          <View style={styles.wishlistCard}>
            {wishlist.length === 0 ? (
              <Text style={styles.wishlistEmptyText}>Your wishlist is empty.</Text>
            ) : (
              wishlist.map((item) => (
                <View key={item.id} style={styles.wishlistItemRow}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.wishlistImage}
                    />
                  ) : (
                    <View style={styles.wishlistPlaceholder} />
                  )}
                  <View style={styles.wishlistItemInfo}>
                    <Text style={styles.wishlistProductName}>{item.productName}</Text>
                    <Text style={styles.wishlistProductPrice}>
                      {formatPrice(item.basePriceCents, item.currency)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.wishlistRemoveBtn}
                    onPress={async () => {
                      const updated = await removeFromWishlist(item.productId);
                      setWishlist(updated);
                    }}
                  >
                    <Text style={styles.wishlistRemoveText}>✕</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      )}


      {perks.map((p) => (
        <View key={p.n} style={styles.perk}>
          <Text style={styles.perkN}>{p.n}</Text>
          <View style={styles.perkBody}>
            <Text style={styles.perkTitle}>{p.title}</Text>
            <Text style={styles.perkDesc}>{p.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  form: {
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
    padding: spacing.lg,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.neutral.ink },
  input: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.12)',
    borderRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.neutral.ink,
  },
  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnText: { color: colors.neutral[50], fontWeight: '700', fontSize: 15 },
  hint: { marginTop: spacing.md, textAlign: 'center', fontSize: 12, color: 'rgba(33, 29, 25, 0.5)' },
  ordersCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
    padding: spacing.lg,
  },
  ordersTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[50] },
  ordersSub: { marginTop: spacing.xs, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ordersLink: { marginTop: spacing.md, fontSize: 14, fontWeight: '600', color: colors.brand.accent },
  perk: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  perkN: { fontSize: 14, fontWeight: '700', color: colors.brand.accent },
  perkBody: { flex: 1 },
  perkTitle: { fontWeight: '700', color: colors.neutral.ink },
  perkDesc: { marginTop: 2, fontSize: 13, color: 'rgba(33, 29, 25, 0.6)' },
  errorText: { color: colors.brand.primary, marginBottom: spacing.sm, fontSize: 13, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral.ink, letterSpacing: 0.3 },
  sectionCount: { fontSize: 12, fontWeight: '600', color: colors.brand.primary, opacity: 0.75 },
  ordersLoadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  ordersEmptyCard: {
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  ordersEmptyIcon: { fontSize: 28, color: colors.brand.accent },
  ordersEmptyTitle: { marginTop: spacing.sm, fontSize: 16, fontWeight: '700', color: colors.brand.primary },
  ordersEmptySub: { marginTop: 4, fontSize: 13, color: 'rgba(33, 29, 25, 0.6)', textAlign: 'center' },
  ordersEmptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: 4,
  },
  ordersEmptyBtnText: { color: colors.neutral[50], fontWeight: '700', fontSize: 13 },
  orderRow: {
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  orderRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderRowLeft: { flex: 1, marginRight: spacing.sm },
  orderRowRight: { alignItems: 'flex-end', gap: 4 },
  orderNumber: { fontSize: 14, fontWeight: '700', color: colors.neutral.ink },
  orderMeta: { fontSize: 12, color: 'rgba(33, 29, 25, 0.6)', marginTop: 2 },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderTotal: { fontSize: 13, fontWeight: '700', color: colors.brand.primary, marginTop: 2 },
  orderLines: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 29, 25, 0.08)',
  },
  orderLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  orderLineName: { flex: 1, fontSize: 13, color: colors.neutral.ink },
  orderLineQty: { fontSize: 12, color: 'rgba(33, 29, 25, 0.6)', marginHorizontal: spacing.sm },
  orderLinePrice: { fontSize: 13, fontWeight: '600', color: colors.brand.primary },
  expandCaret: { textAlign: 'center', marginTop: spacing.sm, fontSize: 10, color: 'rgba(33, 29, 25, 0.4)' },
  wishlistCard: {
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
    padding: spacing.lg,
  },
  wishlistEmptyText: {
    fontSize: 14,
    color: 'rgba(33, 29, 25, 0.6)',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  wishlistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 29, 25, 0.06)',
  },
  wishlistImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: colors.neutral[100],
  },
  wishlistPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: colors.neutral[100],
  },
  wishlistItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  wishlistProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.ink,
  },
  wishlistProductPrice: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  wishlistRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(33, 29, 25, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistRemoveText: {
    fontSize: 12,
    color: 'rgba(33, 29, 25, 0.6)',
    fontWeight: '700',
  },
});
