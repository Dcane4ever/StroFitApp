import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { DiaryItemResponse } from '../../types/diary';
import { formatPeso } from '../../utils/currency';

interface Props {
  item: DiaryItemResponse;
}

export default function DiaryFoodRow({ item }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const qty = item.quantity % 1 === 0 ? item.quantity.toFixed(0) : item.quantity.toString();
  const servingLabel = `${qty} ${item.servingLabel}`;

  return (
    <View style={s.row}>
      <View style={s.left}>
        <Text style={s.name} numberOfLines={1}>{item.foodName}</Text>
        <View style={s.metaRow}>
          <Text style={s.serving}>{servingLabel}</Text>
          <Text style={s.sep}> · </Text>
          <Text style={[s.macro, { color: colors.protein }]}>{item.proteinG.toFixed(1)}P</Text>
          <Text style={s.sep}> </Text>
          <Text style={[s.macro, { color: colors.carbs }]}>{item.carbsG.toFixed(1)}C</Text>
          <Text style={s.sep}> </Text>
          <Text style={[s.macro, { color: colors.fat }]}>{item.fatG.toFixed(1)}F</Text>
        </View>
      </View>

      <View style={s.right}>
        <Text style={s.calories}>{item.calories.toFixed(0)}</Text>
        <Text style={s.calUnit}>kcal</Text>
        {item.priceAmount != null && item.priceAmount > 0 && (
          <Text style={s.price}>{formatPeso(item.priceAmount)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    left: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    name: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      flexWrap: 'wrap',
    },
    serving: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
    },
    sep: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    macro: {
      fontSize: Typography.xs,
      fontWeight: Typography.medium,
    },
    right: {
      alignItems: 'flex-end',
    },
    calories: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.calories,
    },
    calUnit: {
      fontSize: 10,
      color: colors.textDisabled,
      lineHeight: 14,
    },
    price: {
      fontSize: Typography.xs,
      color: colors.success,
      marginTop: 2,
    },
  });
