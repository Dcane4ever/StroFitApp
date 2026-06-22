import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { DailyBudgetSummaryResponse } from '../../types/budget';
import { formatPeso, formatPesoCompact } from '../../utils/currency';

interface Props {
  budget: DailyBudgetSummaryResponse;
}

export default function BudgetSummaryCard({ budget }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const pct = budget.percentUsed != null ? Math.min(budget.percentUsed / 100, 1) : null;
  const isOverBudget = budget.remainingPhp != null && budget.remainingPhp < 0;
  const barColor = isOverBudget ? colors.error : colors.primary;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>Daily Budget</Text>
        {budget.budgetLimitPhp != null && (
          <Text style={s.limit}>{formatPeso(budget.budgetLimitPhp)} limit</Text>
        )}
      </View>

      <View style={s.amountsRow}>
        <View style={s.amountItem}>
          <Text style={[s.amountValue, { color: isOverBudget ? colors.error : colors.textPrimary }]}>
            {formatPeso(budget.totalSpentPhp)}
          </Text>
          <Text style={s.amountLabel}>Spent</Text>
        </View>

        {budget.remainingPhp != null && (
          <View style={s.amountItem}>
            <Text style={[s.amountValue, { color: isOverBudget ? colors.error : colors.success }]}>
              {formatPesoCompact(budget.remainingPhp)}
            </Text>
            <Text style={s.amountLabel}>{isOverBudget ? 'Over' : 'Remaining'}</Text>
          </View>
        )}

        {budget.percentUsed != null && (
          <View style={s.amountItem}>
            <Text style={[s.amountValue, { color: isOverBudget ? colors.error : colors.textPrimary }]}>
              {budget.percentUsed.toFixed(0)}%
            </Text>
            <Text style={s.amountLabel}>Used</Text>
          </View>
        )}
      </View>

      {pct != null && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
        </View>
      )}

      {isOverBudget && (
        <Text style={[s.overHint, { color: colors.error }]}>Over daily budget</Text>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: Typography.xs,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    limit: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    amountsRow: {
      flexDirection: 'row',
      gap: Spacing.xl,
      marginBottom: Spacing.sm,
    },
    amountItem: {},
    amountValue: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
    },
    amountLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 2,
    },
    progressTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      borderRadius: BorderRadius.full,
    },
    overHint: {
      fontSize: Typography.xs,
      marginTop: Spacing.xs,
      fontWeight: Typography.medium,
    },
  });
