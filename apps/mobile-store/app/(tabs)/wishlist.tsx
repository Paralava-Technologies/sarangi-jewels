import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors } from '@noeve/ui-tokens';
import { getWishlist, removeFromWishlist } from '../../src/lib/api';
import { formatPrice } from '../../src/lib/format';
import { useAuth } from '../../src/context/auth-context';

export default function WishlistScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const fetchItems = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getWishlist();
    setItems(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [isAuthenticated])
  );

  const handleRemove = async (productId: string) => {
    const updated = await removeFromWishlist(productId);
    setItems(updated);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sign in to view your wishlist.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/account')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyText}>Pieces you save will appear here.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/shop')}>
          <Text style={styles.btnText}>Explore</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const product = item.product;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/product/${product.slug}`)}
      >
        <View style={styles.mediaContainer}>
          {product.images && product.images[0] ? (
            <Image source={{ uri: product.images[0].url }} style={styles.image} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(product.basePriceCents, product.currency)}</Text>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(product.id)}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Items</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.cream,
  },
  header: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: colors.brand.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.cream,
    padding: 20,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33,29,25,0.1)',
    paddingBottom: 20,
  },
  mediaContainer: {
    width: 100,
    height: 120,
    backgroundColor: colors.neutral.bone,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DCD3C2',
  },
  details: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.brand.primaryDark,
    marginBottom: 6,
  },
  price: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: 16,
  },
  removeBtn: {
    alignSelf: 'flex-start',
  },
  removeBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.brand.primary,
    textDecorationLine: 'underline',
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: colors.brand.primaryDark,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 2,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
