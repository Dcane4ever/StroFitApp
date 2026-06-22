import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { DailyBudgetSummaryResponse } from '../../types/budget';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  budget: DailyBudgetSummaryResponse;
}

const MEAL_COLORS: Record<string, string> = {
  BREAKFAST: '#FFC107',
  LUNCH: '#4CAF50',
  DINNER: '#2196F3',
  SNACK: '#FF6B35',
};

export default function MealCostBreakdownCard({ budget }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const breakdown = budget.mealBreakdown ?? [];
  const totalWithCost = breakdown.filter(m => m.totalSpent > 0);
  if (totalWithCost.length === 0) return null;

  const grandTotal = totalWithCost.reduce((s, m) => s + m.totalSpent, 0);

  return (
    <View style={s.card}>
      <Text style={s.sectionLabel}>Cost by Meal</Text>

      {totalWithCost.map(meal => {
        const pct = grandTotal > 0 ? meal.totalSpent / grandTotal : 0;
        const barColor = MEAL_COLORS[meal.mealType] ?? colors.primary;
        const label = meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase();

        return (
          <View key={meal.mealType} style={s.row}>
            <Text style={s.mealLabel}>{label}</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={s.costLabel}>{formatPesoCompact(meal.totalSpent)}</Text>
          </View>
        );
      })}
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
    sectionLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    mealLabel: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      width: 72,
    },
    barTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    barFill: {
      height: 8,
      borderRadius: BorderRadius.full,
    },
    costLabel: {
      fontSize: Typography.sm,
      color: colors.textPrimary,
      fontWeight: Typography.medium,
      width: 60,
      textAlign: 'right',
    },
  });
