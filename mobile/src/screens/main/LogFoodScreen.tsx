import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MainStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { ServingUnit } from '../../types/food';
import { formatMealBadgeDate } from '../../utils/date';
import { addDiaryItem } from '../../api/diary';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import ServingPicker from '../../components/food/ServingPicker';
import MacroPreviewCard from '../../components/food/MacroPreviewCard';

type Props = MainStackScreenProps<'LogFood'>;

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

// Gram-based serving unit to use when backend provides no serving units
function makeGramUnit(): ServingUnit {
  return { id: '__gram__', label: 'grams', gramsEquivalent: 1, quantityPerUnit: 1, unitType: 'GRAM' };
}

export default function LogFoodScreen({ route, navigation }: Props) {
  const { food, date, mealType } = route.params;
  const { colors } = useThemeStore();

  const servingUnits = useMemo<ServingUnit[]>(() => {
    if (food.servingUnits.length > 0) return food.servingUnits;
    return [makeGramUnit()];
  }, [food.servingUnits]);

  const [selectedUnit, setSelectedUnit] = useState<ServingUnit>(servingUnits[0]);
  const [quantityText, setQuantityText] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantity = parseFloat(quantityText);
  const isValidQty = !isNaN(quantity) && quantity > 0;

  // Compute preview macros
  const preview = useMemo(() => {
    if (!isValidQty) return null;
    const grams = selectedUnit.gramsEquivalent != null
      ? quantity * selectedUnit.gramsEquivalent
      : quantity; // fallback: treat quantity as grams

    const factor = grams / 100;
    return {
      calories: food.caloriesPer100g * factor,
      proteinG: food.proteinPer100g * factor,
      carbsG: food.carbsPer100g * factor,
      fatG: food.fatPer100g * factor,
      fiberG: food.fiberPer100g != null ? food.fiberPer100g * factor : null,
      totalGrams: grams,
    };
  }, [quantity, isValidQty, selectedUnit, food]);

  const handleAdd = useCallback(async () => {
    if (!isValidQty || loading) return;
    setLoading(true);
    setError(null);
    try {
      await addDiaryItem({
        date,
        mealType,
        foodItemId: food.foodItemId,
        brandedProductId: food.brandedProductId ?? null,
        servingUnitId: selectedUnit.id === '__gram__' ? '' : selectedUnit.id,
        quantity,
        notes: notes.trim() || null,
      });
      // Invalidate diary + budget cache so HomeScreen shows fresh data immediately
      queryClient.invalidateQueries({ queryKey: QK.diary(date) });
      queryClient.invalidateQueries({ queryKey: QK.dailyBudget(date) });
      navigation.popToTop();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to add item');
    } finally {
      setLoading(false);
    }
  }, [isValidQty, loading, date, mealType, food, selectedUnit, quantity, notes, navigation]);

  const s = styles(colors);

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>Log Food</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Food identity */}
          <View style={s.section}>
            <Text style={s.foodName}>{food.foodName}</Text>
            {food.brandName != null && (
              <Text style={s.brandName}>{food.brandName}</Text>
            )}
            <View style={s.mealBadge}>
              <Text style={s.mealBadgeText}>
                {MEAL_LABELS[mealType] ?? mealType}  ·  {formatMealBadgeDate(date)}
              </Text>
            </View>
          </View>

          {/* Serving picker */}
          <View style={s.section}>
            <Text style={s.fieldLabel}>Serving unit</Text>
            <ServingPicker
              servingUnits={servingUnits}
              selected={selectedUnit}
              onSelect={setSelectedUnit}
            />
          </View>

          {/* Quantity input */}
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

          {/* Macro preview */}
          {preview != null && (
            <View style={s.section}>
              <Text style={s.fieldLabel}>Nutrition preview</Text>
              <MacroPreviewCard
                calories={preview.calories}
                proteinG={preview.proteinG}
                carbsG={preview.carbsG}
                fatG={preview.fatG}
                fiberG={preview.fiberG}
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
              placeholder="e.g. homemade, less oil…"
              placeholderTextColor={colors.textDisabled}
              multiline
              maxLength={200}
            />
          </View>

          {/* Error */}
          {error != null && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Confirm */}
          <TouchableOpacity
            style={[s.confirmBtn, (!isValidQty || loading) && s.confirmBtnDisabled]}
            onPress={handleAdd}
            disabled={!isValidQty || loading}
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
    content: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    foodName: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    brandName: {
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
    inputError: {
      borderColor: colors.error,
    },
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
    errorText: {
      color: colors.error,
      fontSize: Typography.sm,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md + 2,
      alignItems: 'center',
    },
    confirmBtnDisabled: {
      opacity: 0.45,
    },
    confirmText: {
      color: colors.textInverse,
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
  });
