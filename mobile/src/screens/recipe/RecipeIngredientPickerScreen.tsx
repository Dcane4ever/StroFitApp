import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform, Modal, Alert,
} from 'react-native';
import { RecipeStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { getFoodDetail } from '../../api/food';
import { addRecipeIngredient } from '../../api/recipe';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { FoodSearchResult, FoodDetail, ServingUnit } from '../../types/food';
import FoodSearchBar from '../../components/food/FoodSearchBar';
import FoodSearchResultRow from '../../components/food/FoodSearchResultRow';
import ServingPicker from '../../components/food/ServingPicker';
import MacroPreviewCard from '../../components/food/MacroPreviewCard';

type Props = RecipeStackScreenProps<'RecipeIngredientPicker'>;

// Gram fallback — matches LogFoodScreen pattern
function makeGramUnit(): ServingUnit {
  return { id: '__gram__', label: 'grams', gramsEquivalent: 1, quantityPerUnit: 1, unitType: 'GRAM' };
}

export default function RecipeIngredientPickerScreen({ route, navigation }: Props) {
  const { recipeId } = route.params;
  const { colors } = useThemeStore();
  const { results, loading, error, query, setQuery } = useFoodSearch();

  // Detail loading + ingredient form state
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [servingUnits, setServingUnits] = useState<ServingUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ServingUnit | null>(null);
  const [quantityText, setQuantityText] = useState('1');
  const [addingLoading, setAddingLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const s = styles(colors);

  const handleSelectFood = useCallback(async (item: FoodSearchResult) => {
    setDetailLoading(true);
    try {
      const detail = await getFoodDetail(item.foodItemId);
      const units = detail.servingUnits.length > 0 ? detail.servingUnits : [makeGramUnit()];
      setSelectedFood(detail);
      setServingUnits(units);
      setSelectedUnit(units[0]);
      setQuantityText('1');
      setAddError(null);
      setModalVisible(true);
    } catch {
      // Fallback: build minimal detail from search result
      const fallbackUnits = [makeGramUnit()];
      const fallback: FoodDetail = {
        foodItemId: item.foodItemId,
        foodName: item.foodName,
        brandName: item.brandName,
        brandedProductId: item.brandedProductId,
        source: item.source,
        servingUnits: fallbackUnits,
        caloriesPer100g: item.caloriesPer100g,
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g,
        fiberPer100g: null,
      };
      setSelectedFood(fallback);
      setServingUnits(fallbackUnits);
      setSelectedUnit(fallbackUnits[0]);
      setQuantityText('1');
      setAddError(null);
      setModalVisible(true);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const quantity = parseFloat(quantityText);
  const isValid = selectedFood != null && selectedUnit != null && !isNaN(quantity) && quantity > 0;

  // Compute preview macros
  const preview = (() => {
    if (!isValid || !selectedFood || !selectedUnit) return null;
    const grams = selectedUnit.gramsEquivalent != null ? quantity * selectedUnit.gramsEquivalent : quantity;
    const f = grams / 100;
    return {
      calories: selectedFood.caloriesPer100g * f,
      proteinG: selectedFood.proteinPer100g * f,
      carbsG: selectedFood.carbsPer100g * f,
      fatG: selectedFood.fatPer100g * f,
      fiberG: selectedFood.fiberPer100g != null ? selectedFood.fiberPer100g * f : null,
      totalGrams: grams,
    };
  })();

  const handleAddIngredient = useCallback(async () => {
    if (!isValid || !selectedFood || !selectedUnit || addingLoading) return;
    setAddingLoading(true);
    setAddError(null);
    try {
      await addRecipeIngredient(recipeId, {
        foodItemId: selectedFood.foodItemId,
        servingUnitId: selectedUnit.id === '__gram__' ? '' : selectedUnit.id,
        quantity,
      });
      queryClient.invalidateQueries({ queryKey: QK.recipe(recipeId) });
      queryClient.invalidateQueries({ queryKey: QK.recipes() });
      setModalVisible(false);
      setQuery('');
      setSelectedFood(null);
    } catch (err: any) {
      setAddError(err?.message ?? 'Failed to add ingredient');
    } finally {
      setAddingLoading(false);
    }
  }, [isValid, selectedFood, selectedUnit, quantity, recipeId, addingLoading, setQuery]);

  const renderEmpty = () => {
    if (loading) return null;
    if (query.length < 2) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>Search for an ingredient</Text>
          <Text style={s.emptySubtitle}>Type at least 2 characters</Text>
        </View>
      );
    }
    return (
      <View style={s.emptyState}>
        <Text style={s.emptyTitle}>No results for "{query}"</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Add Ingredient</Text>
        <View style={{ width: 60 }} />
      </View>

      <FoodSearchBar
        value={query}
        onChangeText={setQuery}
        loading={loading || detailLoading}
        autoFocus
        placeholder="Search ingredients…"
      />

      {error != null && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.foodItemId}
        renderItem={({ item }) => (
          <FoodSearchResultRow item={item} onPress={handleSelectFood} />
        )}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={results.length === 0 ? s.emptyListContent : undefined}
      />

      {/* Ingredient quantity/serving modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalKav}>
            <SafeAreaView style={s.modalSheet}>
              <View style={s.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={s.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle} numberOfLines={1}>{selectedFood?.foodName ?? ''}</Text>
                <TouchableOpacity onPress={handleAddIngredient} disabled={!isValid || addingLoading}>
                  {addingLoading
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Text style={[s.modalSave, !isValid && s.modalSaveDisabled]}>Add</Text>
                  }
                </TouchableOpacity>
              </View>

              <View style={s.modalBody}>
                {selectedFood?.brandName != null && (
                  <Text style={s.brand}>{selectedFood.brandName}</Text>
                )}

                <Text style={s.fieldLabel}>Serving unit</Text>
                <ServingPicker
                  servingUnits={servingUnits}
                  selected={selectedUnit}
                  onSelect={setSelectedUnit}
                />

                <Text style={s.fieldLabel}>Quantity</Text>
                <TextInput
                  style={s.qtyInput}
                  value={quantityText}
                  onChangeText={setQuantityText}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textDisabled}
                  selectTextOnFocus
                />

                {preview != null && (
                  <>
                    <Text style={s.fieldLabel}>Nutrition estimate</Text>
                    <MacroPreviewCard
                      calories={preview.calories}
                      proteinG={preview.proteinG}
                      carbsG={preview.carbsG}
                      fatG={preview.fatG}
                      fiberG={preview.fiberG}
                      totalGrams={preview.totalGrams}
                    />
                  </>
                )}

                {addError != null && (
                  <View style={s.addErrorBox}>
                    <Text style={s.addErrorText}>{addError}</Text>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    navBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    back: { fontSize: Typography.base, color: colors.primary, fontWeight: Typography.medium, width: 60 },
    navTitle: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semibold, color: colors.textPrimary, textAlign: 'center' },
    errorBanner: {
      backgroundColor: colors.error + '22', borderRadius: BorderRadius.md,
      marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.sm,
    },
    errorText: { color: colors.error, fontSize: Typography.sm },
    emptyListContent: { flexGrow: 1 },
    emptyState: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxxl,
    },
    emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
    emptyTitle: {
      fontSize: Typography.md, fontWeight: Typography.semibold,
      color: colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs,
    },
    emptySubtitle: { fontSize: Typography.sm, color: colors.textSecondary, textAlign: 'center' },

    // Modal styles
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    modalKav: { justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    modalCancel: { fontSize: Typography.base, color: colors.textSecondary, width: 60 },
    modalTitle: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semibold, color: colors.textPrimary, textAlign: 'center' },
    modalSave: { fontSize: Typography.base, color: colors.primary, fontWeight: Typography.bold, width: 60, textAlign: 'right' },
    modalSaveDisabled: { opacity: 0.35 },
    modalBody: { padding: Spacing.md, paddingBottom: Spacing.xl },
    brand: { fontSize: Typography.sm, color: colors.textSecondary, marginBottom: Spacing.sm },
    fieldLabel: {
      fontSize: Typography.xs, color: colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.7,
      marginBottom: Spacing.sm, marginTop: Spacing.md,
    },
    qtyInput: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2, fontSize: Typography.xl,
      fontWeight: Typography.bold, color: colors.textPrimary, textAlign: 'center',
    },
    addErrorBox: {
      marginTop: Spacing.md, backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md, padding: Spacing.sm,
    },
    addErrorText: { color: colors.error, fontSize: Typography.sm },
  });
