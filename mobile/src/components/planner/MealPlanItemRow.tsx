import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { MealPlanItem } from '../../types/mealPlan';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  item: MealPlanItem;
  onDelete: (item: MealPlanItem) => void;
  onLog?: (item: MealPlanItem) => void;
  logging?: boolean;
}

export default function MealPlanItemRow({ item, onDelete, onLog, logging }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const costStr = item.estimatedCostPhp != null ? ` · ${formatPesoCompact(item.estimatedCostPhp)}` : '';
  const servingStr = item.servingLabel
    ? `${item.quantity} × ${item.servingLabel}`
    : `${item.quantity}`;

  return (
    <View style={s.row}>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{item.foodName}</Text>
        {item.brandName && <Text style={s.brand} numberOfLines={1}>{item.brandName}</Text>}
        <Text style={s.meta}>
          {servingStr} · {item.estimatedCalories.toFixed(0)} kcal{costStr}
        </Text>
      </View>
      <View style={s.actions}>
        {onLog && (
          <TouchableOpacity
            style={[s.logBtn, { backgroundColor: colors.primary + '22' }]}
            onPress={() => onLog(item)}
            disabled={logging}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[s.logBtnText, { color: colors.primary }]}>
              {logging ? '…' : 'Log'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => onDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    brand: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    meta: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginLeft: Spacing.sm,
    },
    logBtn: {
      borderRadius: BorderRadius.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
    },
    logBtnText: {
      fontSize: Typography.xs,
      fontWeight: Typography.semibold,
    },
    deleteBtn: {
      padding: Spacing.xs,
    },
    deleteText: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
    },
  });
