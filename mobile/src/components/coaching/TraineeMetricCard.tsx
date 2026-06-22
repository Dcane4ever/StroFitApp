import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';

interface MetricItem {
  label: string;
  value: string;
  subValue?: string | null;
  valueColor?: string;
  highlight?: boolean;
}

interface Props {
  title: string;
  metrics: MetricItem[];
  accentColor?: string;
}

export default function TraineeMetricCard({ title, metrics, accentColor }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const accent = accentColor ?? colors.primary;

  return (
    <View style={[s.card, { borderLeftColor: accent }]}>
      <Text style={s.title}>{title}</Text>
      <View style={s.grid}>
        {metrics.map((m, i) => (
          <View key={i} style={s.metric}>
            <Text style={[s.value, m.valueColor ? { color: m.valueColor } : null]}>
              {m.value}
            </Text>
            {m.subValue && <Text style={s.subValue}>{m.subValue}</Text>}
            <Text style={s.label}>{m.label}</Text>
          </View>
        ))}
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
      borderLeftWidth: 3,
    },
    title: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    metric: {
      minWidth: 80,
    },
    value: {
      fontSize: Typography.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: Typography.lg * 1.1,
    },
    subValue: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    label: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 2,
    },
  });
