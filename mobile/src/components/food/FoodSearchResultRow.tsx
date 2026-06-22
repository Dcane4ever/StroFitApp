import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { FoodSearchResult } from '../../types/food';

interface Props {
  item: FoodSearchResult;
  onPress: (item: FoodSearchResult) => void;
}

const SOURCE_CONFIG: Record<string, { label: string; variant: 'primary' | 'muted' | 'success' | 'info' }> = {
  CURATED:        { label: 'Verified', variant: 'success' },
  OPEN_FOOD_FACTS:{ label: 'Community', variant: 'muted' },
  USDA:           { label: 'USDA', variant: 'info' },
  USER:           { label: 'Custom', variant: 'primary' },
  AI_ENRICHED:    { label: 'AI', variant: 'muted' },
};

export default function FoodSearchResultRow({ item, onPress }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const src = item.source ? SOURCE_CONFIG[item.source] : null;

  const tagBg: Record<string, string> = {
    primary: colors.primary + '25',
    success: colors.success + '22',
    info:    colors.info + '22',
    muted:   colors.border,
  };
  const tagFg: Record<string, string> = {
    primary: colors.primary,
    success: colors.success,
    info:    colors.info,
    muted:   colors.textDisabled,
  };

  return (
    <TouchableOpacity style={s.row} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={s.main}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1} ellipsizeMode="tail">
            {item.foodName}
          </Text>
          {src != null && (
            <View style={[s.tag, { backgroundColor: tagBg[src.variant] }]}>
              <Text style={[s.tagText, { color: tagFg[src.variant] }]}>{src.label}</Text>
            </View>
          )}
        </View>
        {item.brandName != null && (
          <Text style={s.brand} numberOfLines={1}>{item.brandName}</Text>
        )}
        <View style={s.macroRow}>
          <Text style={[s.macro, { color: colors.protein }]}>{item.proteinPer100g.toFixed(1)}P</Text>
          <Text style={s.dot}> · </Text>
          <Text style={[s.macro, { color: colors.carbs }]}>{item.carbsPer100g.toFixed(1)}C</Text>
          <Text style={s.dot}> · </Text>
          <Text style={[s.macro, { color: colors.fat }]}>{item.fatPer100g.toFixed(1)}F</Text>
          <Text style={s.per}>  per 100g</Text>
        </View>
      </View>
      <View style={s.calBox}>
        <Text style={s.calVal}>{item.caloriesPer100g.toFixed(0)}</Text>
        <Text style={s.calUnit}>kcal</Text>
        <Text style={s.calPer}>/100g</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    main: { flex: 1, marginRight: Spacing.sm },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    name: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      flexShrink: 1,
    },
    tag: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    tagText: {
      fontSize: 10,
      fontWeight: Typography.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    brand: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    macroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    macro: {
      fontSize: Typography.xs,
      fontWeight: Typography.medium,
    },
    dot: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    per: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    calBox: {
      alignItems: 'flex-end',
    },
    calVal: {
      fontSize: Typography.base,
      fontWeight: Typography.bold,
      color: colors.calories,
    },
    calUnit: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    calPer: {
      fontSize: 10,
      color: colors.textDisabled,
    },
  });
