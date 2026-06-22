import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeSummary } from '../../types/recipe';
import { formatPesoCompact } from '../../utils/currency';

interface Props {
  recipe: RecipeSummary;
  onPress: (recipe: RecipeSummary) => void;
}

export default function RecipeCard({ recipe, onPress }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);
  const n = recipe.nutrition;

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(recipe)} activeOpacity={0.75}>
      <View style={s.top}>
        <Text style={s.name} numberOfLines={2}>{recipe.name}</Text>
        {n != null && (
          <View style={s.calBadge}>
            <Text style={s.calValue}>{n.totalCalories.toFixed(0)}</Text>
            <Text style={s.calUnit}> kcal</Text>
          </View>
        )}
      </View>

      {recipe.notes != null && recipe.notes.length > 0 && (
        <Text style={s.notes} numberOfLines={1}>{recipe.notes}</Text>
      )}

      <View style={s.meta}>
        {n != null && (
          <View style={s.macroRow}>
            <Text style={[s.macro, { color: colors.protein }]}>{n.totalProteinG.toFixed(0)}P</Text>
            <Text style={s.macroDot}> · </Text>
            <Text style={[s.macro, { color: colors.carbs }]}>{n.totalCarbsG.toFixed(0)}C</Text>
            <Text style={s.macroDot}> · </Text>
            <Text style={[s.macro, { color: colors.fat }]}>{n.totalFatG.toFixed(0)}F</Text>
          </View>
        )}
        <View style={s.chips}>
          <Text style={s.chip}>{recipe.ingredientCount} ingredients</Text>
          {recipe.servingOptionCount > 0 && (
            <Text style={s.chip}>{recipe.servingOptionCount} servings</Text>
          )}
          {n?.totalEstimatedCost != null && (
            <Text style={[s.chip, { color: colors.success }]}>{formatPesoCompact(n.totalEstimatedCost)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    name: {
      flex: 1,
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      marginRight: Spacing.sm,
    },
    calBadge: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    calValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.calories,
    },
    calUnit: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginBottom: 1,
    },
    notes: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.xs,
    },
    macroRow: { flexDirection: 'row', alignItems: 'center' },
    macro: { fontSize: Typography.xs, fontWeight: Typography.medium },
    macroDot: { fontSize: Typography.xs, color: colors.textDisabled },
    chips: { flexDirection: 'row', gap: Spacing.xs },
    chip: {
      fontSize: 11,
      color: colors.textDisabled,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
  });
