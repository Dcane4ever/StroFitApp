import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { PlannerStackScreenProps } from '../../types/navigation';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { useRecipes } from '../../hooks/queries/useRecipes';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { getFoodDetail } from '../../api/food';
import { getRecipeDetail } from '../../api/recipe';
import { addMealPlanItem } from '../../api/mealPlan';
import { FoodSearchResult, FoodDetail } from '../../types/food';
import { RecipeSummary, RecipeDetail, RecipeServingOption } from '../../types/recipe';
import FoodSearchBar from '../../components/food/FoodSearchBar';
import FoodSearchResultRow from '../../components/food/FoodSearchResultRow';
import ServingPicker from '../../components/food/ServingPicker';
import MacroPreviewCard from '../../components/food/MacroPreviewCard';
import RecipeServingPicker from '../../components/recipe/RecipeServingPicker';

type Props = PlannerStackScreenProps<'MealPlanEditor'>;

type EntryType = 'food' | 'recipe';
type Step = 'pick_type' | 'search' | 'configure';

export default function MealPlanEditorScreen({ route, navigation }: Props) {
  const { planId, date, mealType } = route.params;
  const { colors } = useThemeStore();
  const s = styles(colors);

  const [entryType, setEntryType] = useState<EntryType>('food');
  const [step, setStep] = useState<Step>('search');

  // Food configure state
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [foodServingUnitId, setFoodServingUnitId] = useState('');

  // Recipe configure state
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [recipeServingOption, setRecipeServingOption] = useState<RecipeServingOption | null>(null);

  const [quantity, setQuantity] = useState('1');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  const { query, setQuery, results: foodResults, loading: foodLoading } = useFoodSearch();
  const { recipes, loading: recipesLoading } = useRecipes();

  const mealLabel = mealType.charAt(0) + mealType.slice(1).toLowerCase();
  const qty = parseFloat(quantity) || 0;

  // ─── Food flow ────────────────────────────────────────────────────────────────

  const handleSelectFood = useCallback(async (result: FoodSearchResult) => {
    setLoadingDetail(true);
    try {
      const detail = await getFoodDetail(result.foodItemId);
      setSelectedFood(detail);
      const defaultUnit = detail.servingUnits.find(u => u.label === detail.defaultServingLabel)
        ?? detail.servingUnits[0];
      setFoodServingUnitId(defaultUnit?.id ?? '');
      setQuantity('1');
      setStep('configure');
    } catch {
      Alert.alert('Error', 'Failed to load food details');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ─── Recipe flow ──────────────────────────────────────────────────────────────

  const handleSelectRecipe = useCallback(async (summary: RecipeSummary) => {
    setLoadingDetail(true);
    try {
      const detail = await getRecipeDetail(summary.id);
      setSelectedRecipe(detail);
      const defaultOption = detail.servingOptions.find(o => o.isDefault) ?? detail.servingOptions[0] ?? null;
      setRecipeServingOption(defaultOption);
      setQuantity('1');
      setStep('configure');
    } catch {
      Alert.alert('Error', 'Failed to load recipe details');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (qty <= 0) return;
    setSaving(true);
    try {
      if (entryType === 'food' && selectedFood) {
        await addMealPlanItem(planId, {
          mealType,
          foodItemId: selectedFood.foodItemId,
          servingUnitId: foodServingUnitId === '__gram__' ? '' : foodServingUnitId,
          quantity: qty,
        });
      } else if (entryType === 'recipe' && selectedRecipe && recipeServingOption) {
        await addMealPlanItem(planId, {
          mealType,
          recipeId: selectedRecipe.id,
          servingUnitId: recipeServingOption.id,
          quantity: qty,
        });
      }
      // Invalidate meal plan cache so MealPlanDayScreen sees the new item
      queryClient.invalidateQueries({ queryKey: QK.mealPlan(date) });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  // ─── Food preview ─────────────────────────────────────────────────────────────

  const selectedFoodUnit = selectedFood?.servingUnits.find(u => u.id === foodServingUnitId) ?? null;
  const foodGrams = selectedFoodUnit ? qty * (selectedFoodUnit.gramsEquivalent ?? qty) : qty;
  const foodFactor = foodGrams / 100;

  const foodPreview = selectedFood && selectedFoodUnit && qty > 0 ? {
    calories: selectedFood.caloriesPer100g * foodFactor,
    proteinG: selectedFood.proteinPer100g * foodFactor,
    carbsG: selectedFood.carbsPer100g * foodFactor,
    fatG: selectedFood.fatPer100g * foodFactor,
    totalGrams: foodGrams,
  } : null;

  // ─── Recipe preview ───────────────────────────────────────────────────────────

  const recipePreview = (() => {
    if (!selectedRecipe || !recipeServingOption || qty <= 0 || !selectedRecipe.nutrition) return null;
    const opt = recipeServingOption;
    if (opt.caloriesPerServing != null) {
      return {
        calories: opt.caloriesPerServing * qty,
        proteinG: (opt.proteinGPerServing ?? 0) * qty,
        carbsG: (opt.carbsGPerServing ?? 0) * qty,
        fatG: (opt.fatGPerServing ?? 0) * qty,
        totalGrams: opt.gramsEquivalent != null ? opt.gramsEquivalent * qty : null,
      };
    }
    if (opt.fractionOfRecipe != null) {
      const frac = opt.fractionOfRecipe * qty;
      const n = selectedRecipe.nutrition;
      return {
        calories: n.totalCalories * frac,
        proteinG: n.totalProteinG * frac,
        carbsG: n.totalCarbsG * frac,
        fatG: n.totalFatG * frac,
        totalGrams: null,
      };
    }
    return null;
  })();

  // ─── Configure screen ─────────────────────────────────────────────────────────

  if (step === 'configure') {
    const isFood = entryType === 'food';
    const name = isFood ? selectedFood?.foodName : selectedRecipe?.name;
    const subName = isFood ? selectedFood?.brandName : selectedRecipe?.notes;
    const preview = isFood ? foodPreview : recipePreview;
    const canSave = qty > 0 && (isFood ? !!selectedFoodUnit : !!recipeServingOption);

    return (
      <KeyboardAvoidingView
        style={s.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={s.backRow} onPress={() => setStep('search')}>
          <Text style={s.backText}>‹ Back to search</Text>
        </TouchableOpacity>

        <View style={s.configContent}>
          <Text style={s.configName}>{name}</Text>
          {subName ? <Text style={s.configSub}>{subName}</Text> : null}
          <Text style={s.mealTag}>{mealLabel}</Text>

          <View style={s.qtyRow}>
            <Text style={s.fieldLabel}>Quantity</Text>
            <TextInput
              style={[s.qtyInput, { color: colors.textPrimary, borderColor: colors.border }]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textDisabled}
              selectTextOnFocus
            />
          </View>

          {isFood && selectedFood && selectedFood.servingUnits.length > 0 && (
            <ServingPicker
              servingUnits={selectedFood.servingUnits}
              selected={selectedFoodUnit}
              onSelect={u => setFoodServingUnitId(u.id)}
            />
          )}

          {!isFood && selectedRecipe && selectedRecipe.servingOptions.length > 0 && (
            <RecipeServingPicker
              options={selectedRecipe.servingOptions}
              selected={recipeServingOption}
              onSelect={setRecipeServingOption}
            />
          )}

          {!isFood && selectedRecipe && selectedRecipe.servingOptions.length === 0 && (
            <View style={s.warnBanner}>
              <Text style={s.warnText}>This recipe has no serving options. Add them in the Recipe editor.</Text>
            </View>
          )}

          {preview && (
            <MacroPreviewCard
              calories={preview.calories}
              proteinG={preview.proteinG}
              carbsG={preview.carbsG}
              fatG={preview.fatG}
              totalGrams={preview.totalGrams}
            />
          )}

          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: colors.primary }, (!canSave || saving) && { opacity: 0.5 }]}
            onPress={handleAdd}
            disabled={!canSave || saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.addBtnText}>Add to {mealLabel} Plan</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── Search screen ────────────────────────────────────────────────────────────

  const filteredRecipes = query.trim().length >= 2
    ? recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : recipes;

  return (
    <View style={s.screen}>
      <View style={s.searchHeader}>
        <Text style={s.headerTitle}>Add to {mealLabel} Plan</Text>

        {/* Type toggle */}
        <View style={s.typeToggle}>
          <TouchableOpacity
            style={[s.typeBtn, entryType === 'food' && { backgroundColor: colors.primary }]}
            onPress={() => setEntryType('food')}
          >
            <Text style={[s.typeBtnText, entryType === 'food' && { color: '#fff' }]}>Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.typeBtn, entryType === 'recipe' && { backgroundColor: colors.primary }]}
            onPress={() => setEntryType('recipe')}
          >
            <Text style={[s.typeBtnText, entryType === 'recipe' && { color: '#fff' }]}>Recipe</Text>
          </TouchableOpacity>
        </View>

        <FoodSearchBar
          value={query}
          onChangeText={setQuery}
          loading={entryType === 'food' ? foodLoading : false}
          placeholder={entryType === 'food' ? 'Search foods…' : 'Filter recipes…'}
        />
      </View>

      {loadingDetail && (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* Food list */}
      {!loadingDetail && entryType === 'food' && (
        <FlatList
          data={foodResults}
          keyExtractor={item => `${item.foodItemId}-${item.brandedProductId ?? ''}`}
          renderItem={({ item }) => (
            <FoodSearchResultRow item={item} onPress={handleSelectFood} />
          )}
          ListEmptyComponent={
            query.length >= 2 && !foodLoading ? (
              <View style={s.centered}>
                <Text style={s.emptyText}>No results for "{query}"</Text>
              </View>
            ) : (
              <View style={s.centered}>
                <Text style={s.emptyText}>Search to find foods to plan</Text>
              </View>
            )
          }
          contentContainerStyle={foodResults.length === 0 ? { flexGrow: 1 } : undefined}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Recipe list */}
      {!loadingDetail && entryType === 'recipe' && (
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.recipeRow}
              onPress={() => handleSelectRecipe(item)}
              activeOpacity={0.75}
            >
              <View style={s.recipeInfo}>
                <Text style={s.recipeRowName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.recipeRowMeta}>
                  {item.ingredientCount} ingredients
                  {item.nutrition ? `  ·  ${item.nutrition.totalCalories.toFixed(0)} kcal` : ''}
                  {item.servingOptionCount > 0 ? `  ·  ${item.servingOptionCount} servings` : ''}
                </Text>
              </View>
              <Text style={s.recipeChevron}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            recipesLoading ? (
              <View style={s.centered}><ActivityIndicator color={colors.primary} /></View>
            ) : (
              <View style={s.centered}>
                <Text style={s.emptyText}>
                  {recipes.length === 0
                    ? 'No recipes yet. Create recipes in My Recipes.'
                    : `No recipes matching "${query}"`}
                </Text>
              </View>
            )
          }
          contentContainerStyle={filteredRecipes.length === 0 ? { flexGrow: 1 } : undefined}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchHeader: {
      padding: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: Spacing.sm,
    },
    headerTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    typeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: 3,
      gap: 3,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: Spacing.xs + 1,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
    },
    typeBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    emptyText: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    recipeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    recipeInfo: { flex: 1 },
    recipeRowName: {
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    recipeRowMeta: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recipeChevron: {
      fontSize: Typography.xl,
      color: colors.textDisabled,
    },
    backRow: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
    configContent: {
      flex: 1,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    configName: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    configSub: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginTop: -Spacing.sm,
    },
    mealTag: {
      fontSize: Typography.xs,
      color: colors.primary,
      fontWeight: Typography.medium,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    fieldLabel: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    qtyRow: { gap: Spacing.xs },
    qtyInput: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      backgroundColor: colors.surface,
    },
    warnBanner: {
      backgroundColor: colors.warning + '22',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    warnText: {
      fontSize: Typography.sm,
      color: colors.warning,
    },
    addBtn: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    addBtnText: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: '#fff',
    },
  });
