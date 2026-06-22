import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { RecipeStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { createRecipe, updateRecipe, getRecipeDetail } from '../../api/recipe';
import { deleteRecipeIngredient, deleteRecipeServingOption } from '../../api/recipe';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { RecipeDetail, RecipeServingOption } from '../../types/recipe';
import RecipeIngredientRow from '../../components/recipe/RecipeIngredientRow';
import RecipeServingOptionRow from '../../components/recipe/RecipeServingOptionRow';
import RecipeTotalsCard from '../../components/recipe/RecipeTotalsCard';
import ServingOptionEditorModal from '../../components/recipe/ServingOptionEditorModal';

type Props = RecipeStackScreenProps<'RecipeEditor'>;

export default function RecipeEditorScreen({ route, navigation }: Props) {
  const { recipeId } = route.params ?? {};
  const isEdit = recipeId != null;
  const { colors } = useThemeStore();
  const s = styles(colors);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servingModal, setServingModal] = useState(false);
  const [editServing, setEditServing] = useState<RecipeServingOption | null>(null);

  // Load existing recipe if in edit mode
  useEffect(() => {
    if (!isEdit || !recipeId) return;
    (async () => {
      try {
        const data = await getRecipeDetail(recipeId);
        setRecipe(data);
        setName(data.name);
        setNotes(data.notes ?? '');
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load recipe');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [recipeId, isEdit]);

  const refreshRecipe = useCallback(async () => {
    if (!recipeId) return;
    try {
      const data = await getRecipeDetail(recipeId);
      setRecipe(data);
    } catch {}
  }, [recipeId]);

  const handleSaveBasic = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && recipeId) {
        await updateRecipe(recipeId, { name: name.trim(), notes: notes.trim() || null });
        await refreshRecipe();
        queryClient.invalidateQueries({ queryKey: QK.recipe(recipeId) });
        queryClient.invalidateQueries({ queryKey: QK.recipes() });
        Alert.alert('Saved', 'Recipe details updated.');
      } else {
        const created = await createRecipe({ name: name.trim(), notes: notes.trim() || null });
        queryClient.invalidateQueries({ queryKey: QK.recipes() });
        navigation.replace('RecipeEditor', { recipeId: created.id });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIngredient = useCallback(async (ingredient: { id: string }) => {
    if (!recipeId) return;
    try {
      await deleteRecipeIngredient(recipeId, ingredient.id);
      await refreshRecipe();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to remove ingredient');
    }
  }, [recipeId, refreshRecipe]);

  const handleDeleteServing = useCallback(async (option: RecipeServingOption) => {
    if (!recipeId) return;
    try {
      await deleteRecipeServingOption(recipeId, option.id);
      await refreshRecipe();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to remove serving option');
    }
  }, [recipeId, refreshRecipe]);

  if (initialLoading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>{isEdit ? 'Edit Recipe' : 'New Recipe'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {/* Basic info */}
          <Text style={s.fieldLabel}>Recipe Name *</Text>
          <TextInput
            style={[s.input, !name.trim() && s.inputPlaceholder]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Adobo, Overnight Oats…"
            placeholderTextColor={colors.textDisabled}
            autoFocus={!isEdit}
          />

          <Text style={s.fieldLabel}>Notes / Description</Text>
          <TextInput
            style={[s.input, s.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional — cooking method, portion notes, tips…"
            placeholderTextColor={colors.textDisabled}
            multiline
            maxLength={500}
          />

          {error != null && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.saveBtn, (!name.trim() || saving) && s.saveBtnDisabled]}
            onPress={handleSaveBasic}
            disabled={!name.trim() || saving}
          >
            {saving
              ? <ActivityIndicator color={colors.textInverse} />
              : <Text style={s.saveBtnText}>{isEdit ? 'Update Recipe Info' : 'Create Recipe'}</Text>
            }
          </TouchableOpacity>

          {/* Ingredients section — only shown after recipe created */}
          {recipe != null && (
            <>
              {recipe.nutrition != null && (
                <RecipeTotalsCard nutrition={recipe.nutrition} label="Current Totals" />
              )}

              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>Ingredients ({recipe.ingredients.length})</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RecipeIngredientPicker', { recipeId: recipe.id })}
                >
                  <Text style={s.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              <View style={s.card}>
                {recipe.ingredients.length === 0 ? (
                  <TouchableOpacity
                    style={s.emptyRow}
                    onPress={() => navigation.navigate('RecipeIngredientPicker', { recipeId: recipe.id })}
                  >
                    <Text style={s.emptyRowText}>Tap to add ingredients</Text>
                  </TouchableOpacity>
                ) : (
                  recipe.ingredients.map(ing => (
                    <RecipeIngredientRow
                      key={ing.id}
                      ingredient={ing}
                      onDelete={handleDeleteIngredient}
                    />
                  ))
                )}
              </View>

              {/* Serving options */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>Serving Options ({recipe.servingOptions.length})</Text>
                <TouchableOpacity onPress={() => { setEditServing(null); setServingModal(true); }}>
                  <Text style={s.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              <View style={s.card}>
                {recipe.servingOptions.length === 0 ? (
                  <TouchableOpacity
                    style={s.emptyRow}
                    onPress={() => { setEditServing(null); setServingModal(true); }}
                  >
                    <Text style={s.emptyRowText}>Define how this recipe is portioned (e.g. "1 serving", "1 bowl")</Text>
                  </TouchableOpacity>
                ) : (
                  recipe.servingOptions.map(opt => (
                    <RecipeServingOptionRow
                      key={opt.id}
                      option={opt}
                      onEdit={o => { setEditServing(o); setServingModal(true); }}
                      onDelete={handleDeleteServing}
                    />
                  ))
                )}
              </View>

              <TouchableOpacity
                style={s.doneBtn}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
              >
                <Text style={s.doneBtnText}>View Recipe Detail →</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {recipe != null && (
        <ServingOptionEditorModal
          visible={servingModal}
          recipeId={recipe.id}
          editOption={editServing}
          onClose={() => setServingModal(false)}
          onSaved={refreshRecipe}
        />
      )}
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
    loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: Spacing.md },
    fieldLabel: {
      fontSize: Typography.xs, color: colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.7,
      marginBottom: Spacing.sm, marginTop: Spacing.md,
    },
    input: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2, fontSize: Typography.base, color: colors.textPrimary,
    },
    inputPlaceholder: { borderColor: colors.border },
    notesInput: { minHeight: 80, textAlignVertical: 'top' },
    errorBox: {
      marginTop: Spacing.sm, backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md, padding: Spacing.sm,
    },
    errorText: { color: colors.error, fontSize: Typography.sm },
    saveBtn: {
      marginTop: Spacing.lg, backgroundColor: colors.primary,
      borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.45 },
    saveBtnText: { color: colors.textInverse, fontSize: Typography.md, fontWeight: Typography.bold },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginTop: Spacing.xl, marginBottom: Spacing.sm,
    },
    sectionLabel: {
      fontSize: Typography.xs, fontWeight: Typography.semibold,
      color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8,
    },
    addLink: { fontSize: Typography.sm, color: colors.primary, fontWeight: Typography.semibold },
    card: {
      backgroundColor: colors.surface, borderRadius: BorderRadius.lg,
      overflow: 'hidden', marginBottom: Spacing.sm,
    },
    emptyRow: { padding: Spacing.md },
    emptyRowText: { fontSize: Typography.sm, color: colors.textDisabled, fontStyle: 'italic' },
    doneBtn: {
      marginTop: Spacing.md, borderWidth: 1, borderColor: colors.primary,
      borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center',
    },
    doneBtnText: { color: colors.primary, fontSize: Typography.base, fontWeight: Typography.semibold },
  });
