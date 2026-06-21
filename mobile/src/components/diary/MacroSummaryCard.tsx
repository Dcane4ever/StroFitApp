import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';

interface Props {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  calorieGoal?: number | null;
}

interface MacroPillProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  colors: ReturnType<typeof useThemeStore>['colors'];
}

function MacroPill({ label, value, unit, color, colors }: MacroPillProps) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: Typography.md, fontWeight: Typography.bold, color }}>{value.toFixed(0)}</Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textSecondary, marginTop: 2 }}>{unit}</Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textDisabled, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

export default function MacroSummaryCard({ calories, proteinG, carbsG, fatG, fiberG, calorieGoal }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const progressPct = calorieGoal && calorieGoal > 0
    ? Math.min(calories / calorieGoal, 1)
    : null;

  return (
    <View style={s.card}>
      {/* Calorie headline */}
      <View style={s.calRow}>
        <View style={s.calLeft}>
          <Text style={s.calValue}>{calories.toFixed(0)}</Text>
          <Text style={s.calUnit}> kcal</Text>
        </View>
        {calorieGoal != null && (
          <Text style={s.calGoal}>/ {calorieGoal.toFixed(0)} goal</Text>
        )}
      </View>

      {/* Progress bar */}
      {progressPct != null && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progressPct * 100}%` }]} />
        </View>
      )}

      {/* Macro pills */}
      <View style={s.pillRow}>
        <MacroPill label="Protein" value={proteinG} unit="g" color={colors.protein} colors={colors} />
        <View style={s.divider} />
        <MacroPill label="Carbs" value={carbsG} unit="g" color={colors.carbs} colors={colors} />
        <View style={s.divider} />
        <MacroPill label="Fat" value={fatG} unit="g" color={colors.fat} colors={colors} />
        {fiberG > 0 && (
          <>
            <View style={s.divider} />
            <MacroPill label="Fiber" value={fiberG} unit="g" color={colors.fiber} colors={colors} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
  StyleSheet.create({
    card: {
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    calRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: Spacing.xs,
    },
    calLeft: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      flex: 1,
    },
    calValue: {
      fontSize: Typography.xxxl,
      fontWeight: Typography.bold,
      color: colors.calories,
      lineHeight: Typography.xxxl * 1.1,
    },
    calUnit: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    calGoal: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      alignSelf: 'flex-end',
    },
    progressTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      marginBottom: Spacing.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.calories,
      borderRadius: BorderRadius.full,
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    divider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
  });
