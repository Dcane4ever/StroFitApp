import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeServingOption } from '../../types/recipe';

interface Props {
  option: RecipeServingOption;
  onEdit?: (option: RecipeServingOption) => void;
  onDelete?: (option: RecipeServingOption) => void;
  readonly?: boolean;
}

export default function RecipeServingOptionRow({ option, onEdit, onDelete, readonly = false }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const portionDesc = option.fractionOfRecipe != null
    ? `${(option.fractionOfRecipe * 100).toFixed(0)}% of recipe`
    : option.gramsEquivalent != null
      ? `${option.gramsEquivalent}g`
      : null;

  const handleDelete = () => {
    Alert.alert(
      'Remove Serving Option',
      `Remove "${option.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete?.(option) },
      ],
    );
  };

  return (
    <View style={s.row}>
      <View style={s.left}>
        <View style={s.labelRow}>
          <Text style={s.label}>{option.label}</Text>
          {option.isDefault && (
            <View style={s.defaultBadge}>
              <Text style={s.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        {portionDesc != null && (
          <Text style={s.portion}>{portionDesc}</Text>
        )}
        {option.caloriesPerServing != null && (
          <Text style={s.cal}>{option.caloriesPerServing.toFixed(0)} kcal per serving</Text>
        )}
      </View>
      {!readonly && (
        <View style={s.actions}>
          {onEdit != null && (
            <TouchableOpacity onPress={() => onEdit(option)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.editText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete != null && (
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.deleteText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    left: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    label: {
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    defaultBadge: {
      backgroundColor: colors.primary + '22',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    defaultBadgeText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: Typography.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    portion: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cal: {
      fontSize: Typography.xs,
      color: colors.calories,
      marginTop: 2,
    },
    actions: { flexDirection: 'row', gap: Spacing.md },
    editText: { fontSize: Typography.sm, color: colors.primary, fontWeight: Typography.medium },
    deleteText: { fontSize: Typography.sm, color: colors.error, fontWeight: Typography.medium },
  });
