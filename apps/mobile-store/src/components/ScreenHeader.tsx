import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@sarangi/ui-tokens';

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.brand.accent,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  sub: { marginTop: spacing.xs, fontSize: typography.fontSize.sm, color: colors.neutral[800] },
});
