import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, spacing } from '@sarangi/ui-tokens';
import { fetchOrders, markOrderPicked, markOrderPacked, markOrderShipped } from '../lib/api';

export default function FulfillmentScreen() {
  const [activeTab, setActiveTab] = useState<'PROCESSING' | 'PICKED' | 'PACKED'>('PROCESSING');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchOrders(activeTab, 1, 30);
      setOrders(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleAction = async (orderId: string, currentStatus: string) => {
    setActionLoading(orderId);
    try {
      if (currentStatus === 'PROCESSING') {
        await markOrderPicked(orderId);
      } else if (currentStatus === 'PICKED') {
        await markOrderPacked(orderId);
      } else if (currentStatus === 'PACKED') {
        // Mock tracking/carrier input for demo purposes
        await markOrderShipped(orderId, 'TRACK123456', 'Demo Carrier');
      }
      await loadOrders();
    } catch (err: any) {
      Alert.alert('Action Failed', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <Text style={styles.itemsCount}>{item.lines.length} items</Text>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, actionLoading === item.id && styles.actionButtonDisabled]}
        disabled={actionLoading === item.id}
        onPress={() => handleAction(item.id, item.status)}
      >
        {actionLoading === item.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>
            {item.status === 'PROCESSING' ? 'Mark Picked' : item.status === 'PICKED' ? 'Mark Packed' : 'Ship Order'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['PROCESSING', 'PICKED', 'PACKED'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'PROCESSING' ? 'To Pick' : tab === 'PICKED' ? 'To Pack' : 'To Ship'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders in this queue.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[100] },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.brand.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.neutral[500] },
  activeTabText: { color: colors.brand.primary },
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flex: 1 },
  orderNumber: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
  itemsCount: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  actionButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonDisabled: { opacity: 0.7 },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.neutral[500] },
});
