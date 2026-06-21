import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';
import { MealGroupResponse, MealType } from '../../types/diary';
import DiaryFoodRow from './DiaryFoodRow';

interface Props {
  meal: MealGroupResponse;
  onAddFood: (mealType: MealType) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export default function MealSectionCard({ meal, onAddFood }: Props) {
  const { colors } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const s = styles(colors);

  const label = MEAL_LABELS[meal.mealType];
  const hasItems = meal.items.length > 0;

  return (
    <View style={s.card}>
      {/* Header */}
      <TouchableOpacity style={s.header} onPress={() => setCollapsed(c => !c)} activeOpacity={0.7}>
        <View style={s.headerLeft}>
          <Text style={s.mealTitle}>{label}</Text>
          {hasItems && (
            <View style={s.headerMeta}>
              <Text style={s.headerCal}>{meal.totalCalories.toFixed(0)} kcal</Text>
              {meal.totalCost != null && meal.totalCost > 0 && (
                <Text style={s.headerCost}> · ₱{meal.totalCost.toFixed(2)}</Text>
              )}
            </View>
          )}
        </View>
        <Text style={s.chevron}>{collapsed ? '›' : '⌄'}</Text>
      </TouchableOpacity>

      {/* Items */}
      {!collapsed && (
        <>
          {hasItems ? (
            meal.items.map(item => (
              <DiaryFoodRow key={item.id} item={item} />
            ))
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyText}>No foods logged yet</Text>
            </View>
          )}

          <TouchableOpacity style={s.addBtn} onPress={() => onAddFood(meal.mealType)}>
            <Text style={s.addBtnText}>+ Add Food</Text>
          </TouchableOpacity>
        </>
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
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    headerLeft: {
      flex: 1,
    },
    mealTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    headerMeta: {
      flexDirection: 'row',
      marginTop: 2,
    },
    headerCal: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
    },
    headerCost: {
      fontSize: Typography.xs,
      color: colors.success,
    },
    chevron: {
      fontSize: 20,
      color: colors.textDisabled,
    },
    empty: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
    },
    emptyText: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      fontStyle: 'italic',
    },
    addBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    addBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.primary,
    },
  });
