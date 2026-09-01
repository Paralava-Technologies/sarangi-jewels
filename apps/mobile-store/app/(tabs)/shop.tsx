import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CategoryChips } from '../../src/components/CategoryChips';
import { ProductCard } from '../../src/components/ProductCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { filterByCategory, getCategories, getProducts } from '../../src/lib/api';
import type { Category, Product } from '../../src/lib/types';
import { colors, spacing } from '@sarangi/ui-tokens';

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p);
    setCategories(c);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = filterByCategory(products, activeCategory || undefined);
  const categoryName = categories.find((c) => c.slug === activeCategory)?.name;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ScreenHeader
        eyebrow="Catalogue"
        title={categoryName ?? 'All pieces'}
        subtitle="Considered apparel, beauty and home objects — for the woman who buys once, and buys well."
      />

      <CategoryChips
        categories={categories}
        activeSlug={activeCategory}
        onSelect={setActiveCategory}
      />

      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
      </Text>

      {filtered.length === 0 ? (
        <Text style={styles.empty}>No pieces in this collection yet.</Text>
      ) : (
        <View style={styles.grid}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[50] },
  count: { marginTop: spacing.sm, marginBottom: spacing.md, fontSize: 13, color: 'rgba(33, 29, 25, 0.6)' },
  empty: { textAlign: 'center', color: 'rgba(33, 29, 25, 0.6)', marginTop: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
