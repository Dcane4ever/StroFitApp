import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';
import { DailyBudgetSummaryResponse } from '../../types/budget';

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
        <Text style={s.title}>Budget</Text>
        {budget.budgetLimitPhp != null && (
          <Text style={s.limit}>₱{budget.budgetLimitPhp.toFixed(2)}</Text>
        )}
      </View>

      <View style={s.amountsRow}>
        <View style={s.amountItem}>
          <Text style={[s.amountValue, { color: colors.textPrimary }]}>
            ₱{budget.totalSpentPhp.toFixed(2)}
          </Text>
          <Text style={s.amountLabel}>Spent</Text>
        </View>

        {budget.remainingPhp != null && (
          <View style={s.amountItem}>
            <Text style={[s.amountValue, { color: isOverBudget ? colors.error : colors.success }]}>
              {isOverBudget ? '-' : ''}₱{Math.abs(budget.remainingPhp).toFixed(2)}
            </Text>
            <Text style={s.amountLabel}>{isOverBudget ? 'Over' : 'Left'}</Text>
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
    </View>
  );
}

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
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
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    limit: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
    },
    amountsRow: {
      flexDirection: 'row',
      marginBottom: Spacing.sm,
    },
    amountItem: {
      marginRight: Spacing.xl,
    },
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
  });
