import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { HeroBanner } from '../../src/components/HeroBanner';
import { ProductCard } from '../../src/components/ProductCard';
import { TrustRow } from '../../src/components/TrustRow';
import { getCategories, getProducts } from '../../src/lib/api';
import type { Category, Product } from '../../src/lib/types';
import { colors, spacing } from '@sarangi/ui-tokens';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand.primary} size="large" />
      </View>
    );
  }

  const featured = products.slice(0, 4);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.brandRow}>
        <Text style={styles.logo}>Sarangi Jewels</Text>
        <Link href="/(tabs)/cart">
          <Text style={styles.bagLink}>Bag</Text>
        </Link>
      </View>

      <HeroBanner />

      {categories.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Collections</Text>
            <Link href="/(tabs)/shop">
              <Text style={styles.sectionLink}>View all</Text>
            </Link>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <Link key={cat.id} href="/(tabs)/shop" style={styles.collectionCard}>
                <Text style={styles.collectionLabel}>Collection</Text>
                <Text style={styles.collectionName}>{cat.name}</Text>
              </Link>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <Link href="/(tabs)/shop">
            <Text style={styles.sectionLink}>Shop all</Text>
          </Link>
        </View>
        <View style={styles.grid}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </View>
      </View>

      <TrustRow />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[50] },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  logo: { fontSize: 28, fontWeight: '700', color: colors.brand.primary, letterSpacing: 0.5 },
  bagLink: { fontSize: 14, fontWeight: '600', color: colors.brand.primary },
  section: { marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.neutral.ink },
  sectionLink: { fontSize: 13, fontWeight: '600', color: colors.brand.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  collectionCard: {
    width: 140,
    marginRight: spacing.sm,
    backgroundColor: colors.neutral.cream,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 100,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  collectionLabel: { fontSize: 10, fontWeight: '600', color: colors.brand.primary, opacity: 0.75 },
  collectionName: { fontSize: 16, fontWeight: '700', color: colors.neutral.ink, marginTop: 4 },
});
