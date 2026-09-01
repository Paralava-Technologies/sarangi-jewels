import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@sarangi/ui-tokens';

const items = [
  { title: 'Certified', desc: 'Quality materials' },
  { title: 'Care tips', desc: 'With every piece' },
  { title: 'Tracking', desc: 'Order updates' },
];

export function TrustRow() {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.sm,
    alignItems: 'center',
  },
  title: { fontSize: 11, fontWeight: '700', color: colors.brand.primary },
  desc: { marginTop: 2, fontSize: 10, color: colors.neutral[800], textAlign: 'center' },
});
