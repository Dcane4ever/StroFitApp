import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { DailyBudgetSummaryResponse } from '../../types/budget';
import { formatPeso, formatPesoCompact } from '../../utils/currency';

interface Props {
  budget: DailyBudgetSummaryResponse;
}

export default function BudgetOverviewCard({ budget }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const pct = budget.percentUsed != null ? Math.min(budget.percentUsed / 100, 1) : null;
  const isOver = budget.remainingPhp != null && budget.remainingPhp < 0;
  const barColor = isOver ? colors.error : colors.primary;

  return (
    <View style={s.card}>
      <Text style={s.sectionLabel}>Today's Food Budget</Text>

      <View style={s.mainRow}>
        <View>
          <Text style={[s.spentValue, { color: isOver ? colors.error : colors.textPrimary }]}>
            {formatPeso(budget.totalSpentPhp)}
          </Text>
          <Text style={s.spentLabel}>spent</Text>
        </View>
        {budget.budgetLimitPhp != null && (
          <View style={s.limitBox}>
            <Text style={s.limitLabel}>Limit</Text>
            <Text style={s.limitValue}>{formatPeso(budget.budgetLimitPhp)}</Text>
          </View>
        )}
      </View>

      {pct != null && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: barColor }]} />
        </View>
      )}

      <View style={s.statsRow}>
        {budget.remainingPhp != null && (
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: isOver ? colors.error : colors.success }]}>
              {isOver ? `-${formatPeso(Math.abs(budget.remainingPhp))}` : formatPesoCompact(budget.remainingPhp)}
            </Text>
            <Text style={s.statLabel}>{isOver ? 'over budget' : 'remaining'}</Text>
          </View>
        )}
        {budget.percentUsed != null && (
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: isOver ? colors.error : colors.textPrimary }]}>
              {budget.percentUsed.toFixed(0)}%
            </Text>
            <Text style={s.statLabel}>used</Text>
          </View>
        )}
      </View>

      {isOver && (
        <View style={s.overBanner}>
          <Text style={s.overText}>⚠️ Over daily budget</Text>
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
    mainRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: Spacing.sm,
    },
    spentValue: {
      fontSize: Typography.xxxl,
      fontWeight: Typography.bold,
      lineHeight: Typography.xxxl * 1.05,
    },
    spentLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 2,
    },
    limitBox: {
      alignItems: 'flex-end',
    },
    limitLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    limitValue: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
      marginBottom: Spacing.sm,
    },
    progressFill: {
      height: 6,
      borderRadius: BorderRadius.full,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.xl,
    },
    statItem: {},
    statValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
    statLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 1,
    },
    overBanner: {
      marginTop: Spacing.sm,
      backgroundColor: colors.error + '20',
      borderRadius: BorderRadius.sm,
      padding: Spacing.sm,
    },
    overText: {
      color: colors.error,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
