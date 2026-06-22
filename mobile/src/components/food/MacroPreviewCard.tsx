import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';

interface Props {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
  totalGrams: number | null;
}

interface PillProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function Pill({ label, value, unit, color }: PillProps) {
  const { colors } = useThemeStore();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: Typography.lg, fontWeight: Typography.bold, color }}>
        {value.toFixed(1)}
      </Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textDisabled }}>{unit}</Text>
      <Text style={{ fontSize: Typography.xs, color: colors.textSecondary, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

export default function MacroPreviewCard({ calories, proteinG, carbsG, fatG, fiberG, totalGrams }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  return (
    <View style={s.card}>
      <View style={s.calRow}>
        <Text style={s.calValue}>{calories.toFixed(0)}</Text>
        <Text style={s.calUnit}> kcal</Text>
        {totalGrams != null && (
          <Text style={s.totalGrams}>  ({totalGrams.toFixed(0)}g)</Text>
        )}
      </View>
      <View style={s.pillRow}>
        <Pill label="Protein" value={proteinG} unit="g" color={colors.protein} />
        <View style={s.div} />
        <Pill label="Carbs" value={carbsG} unit="g" color={colors.carbs} />
        <View style={s.div} />
        <Pill label="Fat" value={fatG} unit="g" color={colors.fat} />
        {fiberG != null && fiberG > 0 && (
          <>
            <View style={s.div} />
            <Pill label="Fiber" value={fiberG} unit="g" color={colors.fiber} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
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
      fontSize: Typography.base,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    totalGrams: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      marginBottom: 2,
    },
    pillRow: {
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
