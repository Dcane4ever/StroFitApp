import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { RecipeIngredient } from '../../types/recipe';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  ingredient: RecipeIngredient;
  onDelete?: (ingredient: RecipeIngredient) => void;
  readonly?: boolean;
}

export default function RecipeIngredientRow({ ingredient, onDelete, readonly = false }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const qtyLabel = `${ingredient.quantity % 1 === 0 ? ingredient.quantity.toFixed(0) : ingredient.quantity} ${ingredient.servingLabel}`;

  const handleDelete = () => {
    Alert.alert(
      'Remove Ingredient',
      `Remove ${ingredient.foodName} from recipe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete?.(ingredient) },
      ],
    );
  };

  return (
    <View style={s.row}>
      <View style={s.left}>
        <Text style={s.name} numberOfLines={1}>{ingredient.foodName}</Text>
        <View style={s.metaRow}>
          <Text style={s.serving}>{qtyLabel}</Text>
          <Text style={s.dot}> · </Text>
          <Text style={[s.macro, { color: colors.protein }]}>{ingredient.proteinG.toFixed(1)}P</Text>
          <Text style={s.dot}> </Text>
          <Text style={[s.macro, { color: colors.carbs }]}>{ingredient.carbsG.toFixed(1)}C</Text>
          <Text style={s.dot}> </Text>
          <Text style={[s.macro, { color: colors.fat }]}>{ingredient.fatG.toFixed(1)}F</Text>
        </View>
        {ingredient.estimatedCost != null && (
          <Text style={s.cost}>{formatPesoCompact(ingredient.estimatedCost)}</Text>
        )}
      </View>
      <View style={s.right}>
        <Text style={s.cal}>{ingredient.calories.toFixed(0)}</Text>
        <Text style={s.calUnit}>kcal</Text>
        {!readonly && onDelete != null && (
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={s.deleteBtn}>
            <Text style={s.deleteText}>✕</Text>
          </TouchableOpacity>
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
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    left: { flex: 1, marginRight: Spacing.sm },
    name: {
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      flexWrap: 'wrap',
    },
    serving: { fontSize: Typography.xs, color: colors.textSecondary },
    dot: { fontSize: Typography.xs, color: colors.textDisabled },
    macro: { fontSize: Typography.xs, fontWeight: Typography.medium },
    cost: { fontSize: Typography.xs, color: colors.success, marginTop: 2 },
    right: { alignItems: 'flex-end' },
    cal: { fontSize: Typography.md, fontWeight: Typography.bold, color: colors.calories },
    calUnit: { fontSize: Typography.xs, color: colors.textDisabled },
    deleteBtn: { marginTop: Spacing.xs },
    deleteText: { fontSize: 14, color: colors.error },
  });
