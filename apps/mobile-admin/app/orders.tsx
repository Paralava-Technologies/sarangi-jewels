import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, spacing } from '@sarangi/ui-tokens';
import { fetchOrders } from '../lib/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetchOrders('', 1, 30);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedOrder(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <View style={styles.details}>
        <Text style={styles.detailText}>{item.lines.length} items</Text>
        <Text style={styles.detailText}>
          Total: {(item.totalCents / 100).toLocaleString('en-IN', { style: 'currency', currency: item.currency })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
        />
      )}

      {/* Order Detail Modal */}
      <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedOrder(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order {selectedOrder?.orderNumber}</Text>
            <Button title="Close" onPress={() => setSelectedOrder(null)} color={colors.brand.primary} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.modalText}>{selectedOrder?.status}</Text>
            
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.modalText}>{selectedOrder?.user?.email}</Text>

            <Text style={styles.sectionTitle}>Line Items</Text>
            {selectedOrder?.lines?.map((line: any) => (
              <View key={line.id} style={styles.lineItem}>
                <Text style={styles.modalText}>{line.quantity}x {line.productName}</Text>
                <Text style={styles.modalText}>{(line.unitPrice / 100).toLocaleString('en-IN', { style: 'currency', currency: selectedOrder.currency })}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[100] },
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderNumber: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
  statusBadge: {
    backgroundColor: colors.brand.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 10, fontWeight: '700', color: colors.brand.primary },
  date: { fontSize: 12, color: colors.neutral[500], marginBottom: spacing.sm },
  details: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.neutral[200], paddingTop: spacing.sm },
  detailText: { fontSize: 14, color: colors.neutral[700], fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.neutral[500] },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[900] },
  modalContent: { padding: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.neutral[900], marginTop: spacing.md, marginBottom: spacing.xs },
  modalText: { fontSize: 14, color: colors.neutral[700] },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
});

