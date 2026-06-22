import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';
import { MealType } from '../../types/diary';

interface Props {
  mealType: MealType;
  onAdd: () => void;
}

export default function PlannedMealEmptyState({ mealType, onAdd }: Props) {
  const { colors } = useThemeStore();
  const label = mealType.charAt(0) + mealType.slice(1).toLowerCase();

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: colors.border }]}
      onPress={onAdd}
      activeOpacity={0.7}
    >
      <Text style={[styles.plus, { color: colors.textDisabled }]}>+</Text>
      <Text style={[styles.text, { color: colors.textDisabled }]}>Plan {label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  plus: {
    fontSize: Typography.xl,
    lineHeight: Typography.xl,
  },
  text: {
    fontSize: Typography.sm,
  },
});
