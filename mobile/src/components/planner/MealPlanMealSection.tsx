import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { MealPlanMealGroup } from '../../types/mealPlan';
import { MealPlanItem } from '../../types/mealPlan';
import MealPlanItemRow from './MealPlanItemRow';
import PlannedMealEmptyState from './PlannedMealEmptyState';

interface Props {
  group: MealPlanMealGroup;
  onAddItem: () => void;
  onDeleteItem: (item: MealPlanItem) => void;
  onLogItem?: (item: MealPlanItem) => void;
  loggingItemId?: string | null;
}

export default function MealPlanMealSection({ group, onAddItem, onDeleteItem, onLogItem, loggingItemId }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);
  const [collapsed, setCollapsed] = useState(false);

  const label = group.mealType.charAt(0) + group.mealType.slice(1).toLowerCase();
  const hasItems = group.items.length > 0;
  const costStr = group.totalCostPhp != null ? ` · ₱${group.totalCostPhp.toFixed(2)}` : '';

  return (
    <View style={s.section}>
      <TouchableOpacity
        style={s.header}
        onPress={() => setCollapsed(c => !c)}
        activeOpacity={0.7}
      >
        <Text style={s.mealLabel}>{label}</Text>
        {hasItems && (
          <Text style={s.summary}>
            {group.totalCalories.toFixed(0)} kcal{costStr}
          </Text>
        )}
        <Text style={s.chevron}>{collapsed ? '›' : '⌄'}</Text>
      </TouchableOpacity>

      {!collapsed && (
        <View style={s.body}>
          {group.items.map(item => (
            <MealPlanItemRow
              key={item.id}
              item={item}
              onDelete={onDeleteItem}
              onLog={onLogItem}
              logging={loggingItemId === item.id}
            />
          ))}
          {hasItems ? (
            <TouchableOpacity style={s.addRow} onPress={onAddItem}>
              <Text style={s.addText}>+ Add food</Text>
            </TouchableOpacity>
          ) : (
            <PlannedMealEmptyState mealType={group.mealType} onAdd={onAddItem} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    section: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.sm,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    mealLabel: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      flex: 1,
    },
    summary: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginRight: Spacing.sm,
    },
    chevron: {
      fontSize: Typography.lg,
      color: colors.textDisabled,
    },
    body: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    addRow: {
      paddingVertical: Spacing.sm,
      alignItems: 'center',
    },
    addText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
  });
