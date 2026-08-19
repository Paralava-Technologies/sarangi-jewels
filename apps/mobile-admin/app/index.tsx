import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@noeve/ui-tokens';
import * as SecureStore from 'expo-secure-store';

export default function AdminHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('noeve_admin_token');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sarangi Jewels Admin</Text>
      <Text style={styles.sub}>
        Manage fulfillment pipelines and scan tracking codes on the go.
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/orders')}>
          <Text style={styles.cardTitle}>All Orders</Text>
          <Text style={styles.cardDesc}>View the entire order queue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/fulfillment')}>
          <Text style={styles.cardTitle}>Fulfillment</Text>
          <Text style={styles.cardDesc}>Pick, pack, and ship pipeline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/scanner')}>
          <Text style={styles.cardTitle}>Scan Label</Text>
          <Text style={styles.cardDesc}>Scan order QR/Barcodes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.neutral[50] },
  title: { fontSize: 28, fontWeight: '700', color: colors.brand.primary },
  sub: { marginTop: spacing.md, lineHeight: 22, color: colors.neutral[800], marginBottom: spacing.xl },
  grid: { gap: spacing.md },
  card: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.primary,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: 4 },
  cardDesc: { fontSize: 14, color: colors.neutral[600] },
  logoutBtn: {
    marginTop: 'auto',
    padding: spacing.md,
    alignItems: 'center',
  },
  logoutText: { color: colors.semantic.error, fontSize: 16, fontWeight: '600' },
});

