import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing, typography } from '@sarangi/ui-tokens';

export function HeroBanner() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>SARANGI</Text>
      <Text style={styles.title}>Jewellery that speaks quietly, shines boldly</Text>
      <Text style={styles.sub}>
        Pendants, fine gold pieces, and curated care accessories.
      </Text>
      <View style={styles.actions}>
        <Link href="/(tabs)/shop" style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Shop collection</Text>
        </Link>
        <Link href="/(tabs)/shop" style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Pendants</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.brand.primary,
    borderRadius: 16,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.brand.accent,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 32,
  },
  sub: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  primaryBtn: {
    backgroundColor: colors.brand.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: 24,
  },
  primaryText: { fontWeight: '700', fontSize: 13, color: colors.brand.primary },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: 24,
  },
  secondaryText: { fontWeight: '600', fontSize: 13, color: '#fff' },
});
