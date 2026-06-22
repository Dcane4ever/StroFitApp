import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MainStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeServingOption } from '../../types/recipe';
import { addDiaryRecipe } from '../../api/diary';
import { formatMealBadgeDate } from '../../utils/date';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import RecipeServingPicker from '../../components/recipe/RecipeServingPicker';
import MacroPreviewCard from '../../components/food/MacroPreviewCard';

type Props = MainStackScreenProps<'LogRecipe'>;

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

function computePreview(opt: RecipeServingOption, qty: number, nutrition: any) {
  if (!nutrition) return null;

  // Path 1: serving option already has per-serving nutrition
  if (opt.caloriesPerServing != null) {
    return {
      calories: opt.caloriesPerServing * qty,
      proteinG: (opt.proteinGPerServing ?? 0) * qty,
      carbsG: (opt.carbsGPerServing ?? 0) * qty,
      fatG: (opt.fatGPerServing ?? 0) * qty,
      totalGrams: opt.gramsEquivalent != null ? opt.gramsEquivalent * qty : null,
    };
  }

  // Path 2: fraction of recipe
  if (opt.fractionOfRecipe != null) {
    const frac = opt.fractionOfRecipe * qty;
    return {
      calories: nutrition.totalCalories * frac,
      proteinG: nutrition.totalProteinG * frac,
      carbsG: nutrition.totalCarbsG * frac,
      fatG: nutrition.totalFatG * frac,
      totalGrams: null,
    };
  }

  // Path 3: grams equivalent against total recipe weight (unavailable — show nothing)
  return null;
}

export default function LogRecipeScreen({ route, navigation }: Props) {
  const { recipe, date, mealType } = route.params;
  const { colors } = useThemeStore();

  const defaultOption = recipe.servingOptions.find(o => o.isDefault) ?? recipe.servingOptions[0] ?? null;
  const [selectedOption, setSelectedOption] = useState<RecipeServingOption | null>(defaultOption);
  const [quantityText, setQuantityText] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantity = parseFloat(quantityText);
  const isValidQty = !isNaN(quantity) && quantity > 0;

  const preview = useMemo(() => {
    if (!isValidQty || !selectedOption) return null;
    return computePreview(selectedOption, quantity, recipe.nutrition);
  }, [isValidQty, quantity, selectedOption, recipe.nutrition]);

  const handleAdd = useCallback(async () => {
    if (!isValidQty || !selectedOption || loading) return;
    setLoading(true);
    setError(null);
    try {
      await addDiaryRecipe({
        date,
        mealType,
        recipeId: recipe.id,
        servingOptionId: selectedOption.id,
        quantity,
        notes: notes.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: QK.diary(date) });
      queryClient.invalidateQueries({ queryKey: QK.dailyBudget(date) });
      navigation.popToTop();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to add recipe to diary');
    } finally {
      setLoading(false);
    }
  }, [isValidQty, selectedOption, loading, date, mealType, recipe.id, quantity, notes, navigation]);

  const s = styles(colors);

  const noServings = recipe.servingOptions.length === 0;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>Log Recipe</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Identity */}
          <View style={s.section}>
            <Text style={s.recipeName}>{recipe.name}</Text>
            {recipe.notes && <Text style={s.recipeNotes}>{recipe.notes}</Text>}
            <View style={s.mealBadge}>
              <Text style={s.mealBadgeText}>
                {MEAL_LABELS[mealType] ?? mealType}  ·  {formatMealBadgeDate(date)}
              </Text>
            </View>
          </View>

          {/* Recipe stats */}
          {recipe.nutrition && (
            <View style={[s.section, s.recipeStatsCard]}>
              <Text style={s.fieldLabel}>Full recipe</Text>
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.calories }]}>{recipe.nutrition.totalCalories.toFixed(0)}</Text>
                  <Text style={s.statLabel}>kcal</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.protein }]}>{recipe.nutrition.totalProteinG.toFixed(1)}g</Text>
                  <Text style={s.statLabel}>protein</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.carbs }]}>{recipe.nutrition.totalCarbsG.toFixed(1)}g</Text>
                  <Text style={s.statLabel}>carbs</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: colors.fat }]}>{recipe.nutrition.totalFatG.toFixed(1)}g</Text>
                  <Text style={s.statLabel}>fat</Text>
                </View>
              </View>
              <Text style={s.ingredientCount}>{recipe.ingredientCount} ingredients</Text>
            </View>
          )}

          {/* No servings warning */}
          {noServings && (
            <View style={[s.section, s.warnBanner]}>
              <Text style={s.warnText}>
                This recipe has no serving options defined. Add serving options in the Recipe editor before logging.
              </Text>
            </View>
          )}

          {/* Serving picker */}
          {!noServings && (
            <View style={s.section}>
              <Text style={s.fieldLabel}>Serving option</Text>
              <RecipeServingPicker
                options={recipe.servingOptions}
                selected={selectedOption}
                onSelect={setSelectedOption}
              />
            </View>
          )}

          {/* Quantity */}
          {!noServings && (
            <View style={s.section}>
              <Text style={s.fieldLabel}>Quantity</Text>
              <TextInput
                style={[s.qtyInput, !isValidQty && quantityText.length > 0 && s.inputError]}
                value={quantityText}
                onChangeText={setQuantityText}
                keyboardType="decimal-pad"
                placeholder="e.g. 1"
                placeholderTextColor={colors.textDisabled}
                selectTextOnFocus
              />
            </View>
          )}

          {/* Macro preview */}
          {preview != null && (
            <View style={s.section}>
              <Text style={s.fieldLabel}>Nutrition preview</Text>
              <MacroPreviewCard
                calories={preview.calories}
                proteinG={preview.proteinG}
                carbsG={preview.carbsG}
                fatG={preview.fatG}
                totalGrams={preview.totalGrams}
              />
            </View>
          )}

          {/* Notes */}
          <View style={s.section}>
            <Text style={s.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={s.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. added extra veggies…"
              placeholderTextColor={colors.textDisabled}
              multiline
              maxLength={200}
            />
          </View>

          {error != null && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.confirmBtn, (noServings || !isValidQty || !selectedOption || loading) && s.confirmBtnDisabled]}
            onPress={handleAdd}
            disabled={noServings || !isValidQty || !selectedOption || loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={colors.textInverse} />
              : <Text style={s.confirmText}>Add to Diary</Text>
            }
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    back: {
      fontSize: Typography.base,
      color: colors.primary,
      fontWeight: Typography.medium,
      width: 60,
    },
    navTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
    section: { marginBottom: Spacing.lg },
    recipeName: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    recipeNotes: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    mealBadge: {
      alignSelf: 'flex-start',
      marginTop: Spacing.xs,
      backgroundColor: colors.primary + '22',
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
    },
    mealBadgeText: {
      fontSize: Typography.xs,
      color: colors.primary,
      fontWeight: Typography.semibold,
    },
    recipeStatsCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.xs,
    },
    stat: { alignItems: 'center' },
    statValue: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
    statLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: 1,
    },
    ingredientCount: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginTop: Spacing.xs,
    },
    warnBanner: {
      backgroundColor: colors.warning + '22',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    warnText: {
      fontSize: Typography.sm,
      color: colors.warning,
      lineHeight: Typography.sm * 1.5,
    },
    fieldLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      marginBottom: Spacing.sm,
    },
    qtyInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    inputError: { borderColor: colors.error },
    notesInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.base,
      color: colors.textPrimary,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    errorBanner: {
      backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
    },
    errorText: { color: colors.error, fontSize: Typography.sm },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md + 2,
      alignItems: 'center',
    },
    confirmBtnDisabled: { opacity: 0.45 },
    confirmText: {
      color: colors.textInverse,
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
  });
