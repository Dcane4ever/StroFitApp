import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { WeightProgressSummaryResponse } from '../../types/weight';

interface Props {
  summary: WeightProgressSummaryResponse;
}

interface StatCellProps {
  label: string;
  value: string;
  valueColor?: string;
}

function StatCell({ label, value, valueColor }: StatCellProps) {
  const { colors } = useThemeStore();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: Typography.md, fontWeight: Typography.bold, color: valueColor ?? colors.textPrimary }}>
        {value}
      </Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textDisabled, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function changeLabel(val: number | null, unit: string): string {
  if (val == null) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)} ${unit}`;
}

function changeColor(val: number | null, colors: AppColors): string {
  if (val == null) return colors.textDisabled;
  if (Math.abs(val) < 0.05) return colors.textSecondary;
  // Losing weight = green (for most fitness goals); gaining = warning
  // Neutral display — user decides their goal
  return val < 0 ? colors.success : colors.warning;
}

export default function WeightSummaryCard({ summary }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const unit = summary.weightUnit === 'LBS' ? 'lbs' : 'kg';
  const latestStr = summary.latestWeight != null
    ? `${summary.latestWeight.toFixed(1)} ${unit}`
    : '—';

  const lastUpdated = summary.latestLogDate
    ? new Date(summary.latestLogDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <View style={s.card}>
      {/* Latest weight headline */}
      <View style={s.headline}>
        <View>
          <Text style={s.latestLabel}>Current Weight</Text>
          <Text style={s.latestValue}>{latestStr}</Text>
          {lastUpdated != null && (
            <Text style={s.lastUpdated}>Updated {lastUpdated}</Text>
          )}
        </View>
        {summary.goalWeightKg != null && (
          <View style={s.goalBox}>
            <Text style={s.goalLabel}>Goal</Text>
            <Text style={s.goalValue}>{summary.goalWeightKg.toFixed(1)} kg</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <StatCell
          label="vs prev"
          value={changeLabel(summary.changeFromPrevious, unit)}
          valueColor={changeColor(summary.changeFromPrevious, colors)}
        />
        <View style={s.div} />
        <StatCell
          label="7 days"
          value={changeLabel(summary.change7Day, unit)}
          valueColor={changeColor(summary.change7Day, colors)}
        />
        <View style={s.div} />
        <StatCell
          label="30 days"
          value={changeLabel(summary.change30Day, unit)}
          valueColor={changeColor(summary.change30Day, colors)}
        />
        <View style={s.div} />
        <StatCell
          label="Entries"
          value={summary.totalLogs.toString()}
        />
      </View>
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
    headline: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    latestLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    latestValue: {
      fontSize: Typography.xxxl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      lineHeight: Typography.xxxl * 1.05,
    },
    lastUpdated: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 4,
    },
    goalBox: {
      alignItems: 'flex-end',
      backgroundColor: colors.primary + '18',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    goalLabel: {
      fontSize: Typography.xs,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    goalValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.primary,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    div: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
  });
