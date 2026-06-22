import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { MealGroupResponse, MealType } from '../../types/diary';
import { formatPesoCompact } from '../../utils/currency';
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

const MEAL_ICONS: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '🍱',
  DINNER: '🍽️',
  SNACK: '🥜',
};

const EMPTY_HINTS: Record<MealType, string> = {
  BREAKFAST: 'Add your morning meal — eggs, rice, bread…',
  LUNCH: 'Log your lunch — ulam, rice, drinks…',
  DINNER: 'What did you eat for dinner?',
  SNACK: 'Chips, fruits, coffee — log it all.',
};

export default function MealSectionCard({ meal, onAddFood }: Props) {
  const { colors } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const s = styles(colors);

  const label = MEAL_LABELS[meal.mealType];
  const icon = MEAL_ICONS[meal.mealType];
  const hasItems = meal.items.length > 0;

  return (
    <View style={s.card}>
      {/* Header */}
      <TouchableOpacity
        style={s.header}
        onPress={() => setCollapsed(c => !c)}
        activeOpacity={0.7}
      >
        <View style={s.headerLeft}>
          <Text style={s.icon}>{icon}</Text>
          <View>
            <Text style={s.mealTitle}>{label}</Text>
            {hasItems && (
              <View style={s.headerMeta}>
                <Text style={s.headerCal}>{meal.totalCalories.toFixed(0)} kcal</Text>
                {meal.totalCost != null && meal.totalCost > 0 && (
                  <Text style={s.headerCost}> · {formatPesoCompact(meal.totalCost)}</Text>
                )}
              </View>
            )}
          </View>
        </View>
        <Text style={[s.chevron, collapsed && s.chevronCollapsed]}>
          {collapsed ? '›' : '⌄'}
        </Text>
      </TouchableOpacity>

      {/* Body */}
      {!collapsed && (
        <>
          {hasItems ? (
            <>
              {meal.items.map(item => (
                <DiaryFoodRow key={item.id} item={item} />
              ))}
            </>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyHint}>{EMPTY_HINTS[meal.mealType]}</Text>
            </View>
          )}

          <TouchableOpacity
            style={s.addBtn}
            onPress={() => onAddFood(meal.mealType)}
            activeOpacity={0.7}
          >
            <Text style={s.addBtnPlus}>+</Text>
            <Text style={s.addBtnText}>Add food or recipe</Text>
          </TouchableOpacity>
        </>
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
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 4,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    icon: {
      fontSize: 20,
    },
    mealTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    headerMeta: {
      flexDirection: 'row',
      marginTop: 2,
      alignItems: 'center',
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
      lineHeight: 24,
    },
    chevronCollapsed: {
      color: colors.textDisabled,
    },
    empty: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    emptyHint: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      fontStyle: 'italic',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    addBtnPlus: {
      fontSize: Typography.md,
      color: colors.primary,
      fontWeight: Typography.bold,
      lineHeight: Typography.md * 1.2,
    },
    addBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.primary,
    },
  });
