import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCart } from '../../src/context/cart-context';
import { getProduct, getWishlist, addToWishlist, removeFromWishlist } from '../../src/lib/api';
import { formatPrice } from '../../src/lib/format';
import type { Product } from '../../src/lib/types';
import { colors, spacing } from '@noeve/ui-tokens';
import { useAuth } from '../../src/context/auth-context';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [selectedMetal, setSelectedMetal] = useState('Yellow Gold');
  const [selectedPurity, setSelectedPurity] = useState('18K Gold');
  const [selectedChainLength, setSelectedChainLength] = useState('45cm');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    getProduct(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (isAuthenticated && product) {
      getWishlist().then((items) => {
        setInWishlist(items.some((item) => item.productId === product.id));
      }).catch(() => {});
    }
  }, [product, isAuthenticated]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      Alert.alert('Wishlist', 'Please sign in to save items to your wishlist.');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
      }
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, product.variants?.[0]?.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Product not found</Text>
      </View>
    );
  }

  const image = product.images?.[0];
  const specs = [
    { label: 'Material', value: product.material || selectedMetal },
    { label: 'Purity', value: product.purity || selectedPurity },
    { label: 'Gemstone', value: product.gemstone },
    { label: 'Weight', value: product.weightGrams ? `${product.weightGrams} g` : null },
  ].filter((s) => s.value);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Gallery Section */}
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Sarangi Jewels</Text>
            </View>
          )}
        </View>

        {/* Product Details Header */}
        <View style={styles.detailsHeader}>
          {product.category ? (
            <Text style={styles.category}>{product.category.name.toUpperCase()}</Text>
          ) : null}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.subtitle}>Considered apparel, beauty and home objects — for the woman who buys once, and buys well.</Text>
          <Text style={styles.price}>{formatPrice(product.basePriceCents, product.currency)}</Text>
        </View>

        {/* Selectors / Configurator Section */}
        <View style={styles.selectorsCard}>
          {/* Metal Selector */}
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Metal:</Text>
            <View style={styles.selectorChips}>
              {['Yellow Gold', 'White Gold', 'Rose Gold'].map((metal) => (
                <Pressable
                  key={metal}
                  style={[styles.chip, selectedMetal === metal && styles.chipActive]}
                  onPress={() => setSelectedMetal(metal)}
                >
                  <Text style={[styles.chipText, selectedMetal === metal && styles.chipTextActive]}>
                    {metal.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Purity Selector */}
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Purity:</Text>
            <View style={styles.selectorChips}>
              {['18K Gold', '22K Gold'].map((purity) => (
                <Pressable
                  key={purity}
                  style={[styles.chip, selectedPurity === purity && styles.chipActive]}
                  onPress={() => setSelectedPurity(purity)}
                >
                  <Text style={[styles.chipText, selectedPurity === purity && styles.chipTextActive]}>
                    {purity}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Chain Length Selector */}
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Chain Length:</Text>
            <View style={styles.selectorChips}>
              {['40cm', '45cm', '50cm'].map((len) => (
                <Pressable
                  key={len}
                  style={[styles.chip, selectedChainLength === len && styles.chipActive]}
                  onPress={() => setSelectedChainLength(len)}
                >
                  <Text style={[styles.chipText, selectedChainLength === len && styles.chipTextActive]}>
                    {len}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityRow}>
            <Text style={styles.selectorLabel}>Quantity:</Text>
            <View style={styles.quantityCounter}>
              <Pressable
                style={styles.quantityBtn}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Text style={styles.quantityBtnText}>-</Text>
              </Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable style={styles.quantityBtn} onPress={() => setQuantity(quantity + 1)}>
                <Text style={styles.quantityBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Specifications List */}
        {product.description ? (
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText}>{product.description}</Text>
          </View>
        ) : null}

        {specs.length > 0 ? (
          <View style={styles.specs}>
            {specs.map((s) => (
              <View key={s.label} style={styles.specRow}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {product.careInstructions ? (
          <View style={styles.care}>
            <Text style={styles.careTitle}>✨ Care Instructions</Text>
            <Text style={styles.careText}>{product.careInstructions}</Text>
          </View>
        ) : null}

        {/* Extra buffer for sticky button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.addBtn, adding && styles.addBtnDisabled, added && styles.addBtnSuccess]}
            onPress={handleAdd}
            disabled={adding}
          >
            <Text style={styles.addBtnText}>
              {adding ? 'ADDING TO BAG…' : added ? 'ADDED ✓' : `ADD TO BAG — ${formatPrice(product.basePriceCents * quantity, product.currency)}`}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.wishlistBtn, wishlistLoading && styles.wishlistBtnDisabled]}
            onPress={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            <Text style={[styles.wishlistBtnText, inWishlist && styles.wishlistBtnTextActive]}>
              {inWishlist ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.secureText}>Secure Checkout · 30-Day Returns · Free Over $150</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[50] },
  error: { color: colors.brand.primary, fontSize: 16, fontWeight: '600' },
  imageWrap: {
    aspectRatio: 4.2 / 5,
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { opacity: 0.3, fontSize: 24, color: colors.brand.accent },
  detailsHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.brand.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.ink,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(33, 29, 25, 0.6)',
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
  price: {
    marginTop: spacing.md,
    fontSize: 24,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  selectorsCard: {
    backgroundColor: colors.neutral.cream,
    borderRadius: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33,29,25,0.06)',
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.ink,
  },
  selectorChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: 'rgba(33,29,25,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(33,29,25,0.08)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral.ink,
  },
  chipTextActive: {
    color: colors.neutral[50],
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  quantityCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33,29,25,0.04)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33,29,25,0.08)',
  },
  quantityBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  quantityBtnText: {
    color: colors.neutral.ink,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityValue: {
    color: colors.neutral.ink,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  descSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  descTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  descText: {
    fontSize: 14,
    color: 'rgba(33, 29, 25, 0.75)',
    lineHeight: 22,
  },
  specs: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(33,29,25,0.08)',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(33, 29, 25, 0.6)', textTransform: 'uppercase' },
  specValue: { fontSize: 13, fontWeight: '700', color: colors.brand.primary },
  care: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.neutral.cream,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  careTitle: { fontWeight: '700', color: colors.brand.primary, fontSize: 13 },
  careText: { marginTop: spacing.xs, fontSize: 13, color: 'rgba(33, 29, 25, 0.75)', lineHeight: 18 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: 'rgba(33,29,25,0.08)',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
    paddingVertical: 14,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnSuccess: { backgroundColor: colors.semantic.success },
  addBtnText: { color: colors.neutral[50], fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  wishlistBtn: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.cream,
  },
  wishlistBtnDisabled: {
    opacity: 0.6,
  },
  wishlistBtnText: {
    fontSize: 24,
    color: colors.neutral.ink,
    lineHeight: 28,
  },
  wishlistBtnTextActive: {
    color: colors.brand.primary,
  },
  secureText: {
    marginTop: spacing.sm,
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(33, 29, 25, 0.5)',
    letterSpacing: 0.2,
  },
});
