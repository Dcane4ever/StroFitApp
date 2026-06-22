import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { BarcodeLookupResponse } from '../../types/barcode';

interface Props {
  result: BarcodeLookupResponse;
}

const STATUS_LABEL: Record<string, string> = {
  FOUND_LOCAL: 'Verified',
  FOUND_ENRICHED: 'Enriched',
};

const STATUS_COLOR_KEY: Record<string, 'primary' | 'info' | 'warning'> = {
  FOUND_LOCAL: 'primary',
  FOUND_ENRICHED: 'info',
};

export default function BarcodeResultCard({ result }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const tagLabel = STATUS_LABEL[result.status];
  const tagColorKey = STATUS_COLOR_KEY[result.status] ?? 'primary';
  const tagColor = colors[tagColorKey];

  return (
    <View style={s.card}>
      {/* Name + brand */}
      <View style={s.nameRow}>
        <Text style={s.foodName} numberOfLines={2}>{result.foodName}</Text>
        {tagLabel != null && (
          <View style={[s.tag, { backgroundColor: tagColor + '25' }]}>
            <Text style={[s.tagText, { color: tagColor }]}>{tagLabel}</Text>
          </View>
        )}
      </View>
      {result.brandName != null && (
        <Text style={s.brandName}>{result.brandName}</Text>
      )}
      <Text style={s.barcodeVal}>{result.barcode}</Text>

      {/* Nutrition per 100g */}
      {result.caloriesPer100g != null && (
        <View style={s.nutritionBlock}>
          <View style={s.calRow}>
            <Text style={s.calValue}>{result.caloriesPer100g.toFixed(0)}</Text>
            <Text style={s.calUnit}> kcal / 100g</Text>
          </View>
          <View style={s.macroRow}>
            {result.proteinPer100g != null && (
              <Text style={[s.macro, { color: colors.protein }]}>
                {result.proteinPer100g.toFixed(1)}g P
              </Text>
            )}
            {result.carbsPer100g != null && (
              <Text style={[s.macro, { color: colors.carbs }]}>
                {result.carbsPer100g.toFixed(1)}g C
              </Text>
            )}
            {result.fatPer100g != null && (
              <Text style={[s.macro, { color: colors.fat }]}>
                {result.fatPer100g.toFixed(1)}g F
              </Text>
            )}
            {result.fiberPer100g != null && result.fiberPer100g > 0 && (
              <Text style={[s.macro, { color: colors.fiber }]}>
                {result.fiberPer100g.toFixed(1)}g Fiber
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
      marginBottom: 4,
    },
    foodName: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      flex: 1,
    },
    tag: {
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginTop: 4,
    },
    tagText: {
      fontSize: 10,
      fontWeight: Typography.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    brandName: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    barcodeVal: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      fontFamily: 'monospace',
      marginBottom: Spacing.md,
    },
    nutritionBlock: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: Spacing.md,
    },
    calRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: Spacing.sm,
    },
    calValue: {
      fontSize: Typography.xxl,
      fontWeight: Typography.bold,
      color: colors.calories,
      lineHeight: Typography.xxl * 1.1,
    },
    calUnit: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginBottom: 3,
    },
    macroRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      flexWrap: 'wrap',
    },
    macro: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
