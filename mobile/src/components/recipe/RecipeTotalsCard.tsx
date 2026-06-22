import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeNutritionTotals } from '../../types/recipe';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  nutrition: RecipeNutritionTotals;
  label?: string;
}

interface PillProps {
  label: string;
  value: number;
  color: string;
}

function Pill({ label, value, color }: PillProps) {
  const { colors } = useThemeStore();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: Typography.md, fontWeight: Typography.bold, color }}>{value.toFixed(0)}</Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textDisabled }}>g</Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textSecondary, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

export default function RecipeTotalsCard({ nutrition, label = 'Recipe Totals' }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.sectionLabel}>{label}</Text>
        {nutrition.totalEstimatedCost != null && (
          <Text style={s.cost}>{formatPesoCompact(nutrition.totalEstimatedCost)} est.</Text>
        )}
      </View>
      <View style={s.calRow}>
        <Text style={s.calValue}>{nutrition.totalCalories.toFixed(0)}</Text>
        <Text style={s.calUnit}> kcal total</Text>
      </View>
      <View style={s.pillRow}>
        <Pill label="Protein" value={nutrition.totalProteinG} color={colors.protein} />
        <View style={s.div} />
        <Pill label="Carbs" value={nutrition.totalCarbsG} color={colors.carbs} />
        <View style={s.div} />
        <Pill label="Fat" value={nutrition.totalFatG} color={colors.fat} />
        {nutrition.totalFiberG > 0 && (
          <>
            <View style={s.div} />
            <Pill label="Fiber" value={nutrition.totalFiberG} color={colors.fiber} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    sectionLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontWeight: Typography.semibold,
    },
    cost: {
      fontSize: Typography.sm,
      color: colors.success,
      fontWeight: Typography.medium,
    },
    calRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: Spacing.md,
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
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    div: { width: 1, height: 32, backgroundColor: colors.border },
  });
