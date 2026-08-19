
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing } from '@noeve/ui-tokens';
import { formatPrice } from '../lib/format';
import type { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
  width?: number | `${number}%`;
}

export function ProductCard({ product, width = '48%' }: ProductCardProps) {
  const image = product.images?.[0];

  return (
    <Link href={`/product/${product.slug}`} asChild>
      <Pressable style={[styles.card, { width }]}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Sarangi Jewels</Text>
            </View>
          )}
          {product.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.category.name}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.material ? (
          <Text style={styles.meta} numberOfLines={1}>
            {product.material}
            {product.purity ? ` · ${product.purity}` : ''}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatPrice(product.basePriceCents, product.currency)}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: 6,
    backgroundColor: colors.neutral.cream,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  imageWrap: {
    aspectRatio: 4 / 5,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.neutral.stone,
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.brand.accent, opacity: 0.4 },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.neutral.cream,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.ink,
    paddingHorizontal: 4,
  },
  meta: {
    marginTop: 2,
    fontSize: 10,
    color: 'rgba(33, 29, 25, 0.6)',
    paddingHorizontal: 4,
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
    paddingHorizontal: 4,
  },
});
