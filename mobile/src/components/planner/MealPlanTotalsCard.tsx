import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { MealPlan } from '../../types/mealPlan';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  plan: MealPlan;
}

export default function MealPlanTotalsCard({ plan }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const macros: { label: string; value: number; color: string }[] = [
    { label: 'Protein', value: plan.totalProteinG, color: colors.protein },
    { label: 'Carbs', value: plan.totalCarbsG, color: colors.carbs },
    { label: 'Fat', value: plan.totalFatG, color: colors.fat },
  ];

  return (
    <View style={s.card}>
      <Text style={s.sectionLabel}>Plan Totals</Text>

      <View style={s.caloriesRow}>
        <Text style={s.caloriesValue}>{plan.totalCalories.toFixed(0)}</Text>
        <Text style={s.caloriesUnit}>kcal planned</Text>
        {plan.targetCalories != null && (
          <Text style={s.target}>/ {plan.targetCalories} target</Text>
        )}
      </View>

      <View style={s.macrosRow}>
        {macros.map(m => (
          <View key={m.label} style={s.macro}>
            <Text style={[s.macroValue, { color: m.color }]}>{m.value.toFixed(1)}g</Text>
            <Text style={s.macroLabel}>{m.label}</Text>
          </View>
        ))}
        {plan.totalCostPhp != null && (
          <View style={s.macro}>
            <Text style={[s.macroValue, { color: colors.accent }]}>{formatPesoCompact(plan.totalCostPhp)}</Text>
            <Text style={s.macroLabel}>Cost</Text>
          </View>
        )}
      </View>

      {plan.targetBudgetPhp != null && plan.totalCostPhp != null && (
        <View style={s.budgetBar}>
          <View
            style={[
              s.budgetFill,
              {
                width: `${Math.min((plan.totalCostPhp / plan.targetBudgetPhp) * 100, 100)}%`,
                backgroundColor: plan.totalCostPhp > plan.targetBudgetPhp ? colors.error : colors.primary,
              },
            ]}
          />
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
      marginBottom: Spacing.sm,
    },
    sectionLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    caloriesRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    caloriesValue: {
      fontSize: Typography.xxl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    caloriesUnit: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
    },
    target: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
    },
    macrosRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    macro: {},
    macroValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
    macroLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 1,
    },
    budgetBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
      marginTop: Spacing.sm,
    },
    budgetFill: {
      height: 4,
      borderRadius: BorderRadius.full,
    },
  });
