import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { BudgetRangeSummaryResponse } from '../../types/budget';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  range: BudgetRangeSummaryResponse;
}

export default function BudgetTrendCard({ range }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const entries = range.dailyEntries ?? [];
  const maxSpend = entries.length > 0 ? Math.max(...entries.map(e => e.totalSpentPhp), 0.01) : 1;

  return (
    <View style={s.card}>
      <Text style={s.sectionLabel}>7-Day Spend</Text>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{formatPesoCompact(range.averageDailySpendPhp)}</Text>
          <Text style={s.statLabel}>avg / day</Text>
        </View>
        <View style={s.statItem}>
          <Text style={s.statValue}>{formatPesoCompact(range.totalSpentPhp)}</Text>
          <Text style={s.statLabel}>total</Text>
        </View>
        {range.daysOverBudget > 0 && (
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: colors.error }]}>{range.daysOverBudget}d</Text>
            <Text style={s.statLabel}>over limit</Text>
          </View>
        )}
      </View>

      {entries.length > 0 && (
        <View style={s.barChart}>
          {entries.map((entry, i) => {
            const heightPct = entry.totalSpentPhp / maxSpend;
            const isOver = entry.overBudget;
            const dayLabel = new Date(entry.date).toLocaleDateString('en-PH', { weekday: 'short' }).slice(0, 2);
            return (
              <View key={i} style={s.barColumn}>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        height: `${Math.max(heightPct * 100, 4)}%`,
                        backgroundColor: isOver ? colors.error : colors.primary,
                      },
                    ]}
                  />
                  {range.budgetLimitPhp != null && entry.totalSpentPhp > 0 && (
                    <View style={[s.limitLine, { bottom: `${(range.budgetLimitPhp / maxSpend) * 100}%` }]} />
                  )}
                </View>
                <Text style={s.dayLabel}>{dayLabel}</Text>
              </View>
            );
          })}
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
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.xl,
      marginBottom: Spacing.md,
    },
    statItem: {},
    statValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 1,
    },
    barChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      height: 72,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    barTrack: {
      width: '100%',
      height: 60,
      justifyContent: 'flex-end',
      position: 'relative',
    },
    barFill: {
      width: '100%',
      borderRadius: 3,
      position: 'absolute',
      bottom: 0,
    },
    limitLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.textDisabled,
    },
    dayLabel: {
      fontSize: 9,
      color: colors.textDisabled,
      marginTop: 3,
    },
  });
