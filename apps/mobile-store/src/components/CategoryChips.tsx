import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@sarangi/ui-tokens';
import type { Category } from '../lib/types';

interface CategoryChipsProps {
  categories: Category[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
}

export function CategoryChips({ categories, activeSlug, onSelect }: CategoryChipsProps) {
  const items = [{ slug: '', name: 'All' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((item) => {
        const active = (activeSlug ?? '') === item.slug;
        return (
          <Pressable
            key={item.slug || 'all'}
            onPress={() => onSelect(item.slug)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  chipActive: { backgroundColor: colors.brand.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.neutral[800] },
  chipTextActive: { color: '#fff' },
});
