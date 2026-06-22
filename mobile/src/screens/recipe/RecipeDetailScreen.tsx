import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { RecipeStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useRecipeDetail } from '../../hooks/queries/useRecipeDetail';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import {
  deleteRecipeIngredient,
  deleteRecipeServingOption,
} from '../../api/recipe';
import { RecipeServingOption } from '../../types/recipe';
import RecipeTotalsCard from '../../components/recipe/RecipeTotalsCard';
import RecipeIngredientRow from '../../components/recipe/RecipeIngredientRow';
import RecipeServingOptionRow from '../../components/recipe/RecipeServingOptionRow';
import ServingOptionEditorModal from '../../components/recipe/ServingOptionEditorModal';

type Props = RecipeStackScreenProps<'RecipeDetail'>;

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { recipeId } = route.params;
  const { colors } = useThemeStore();
  const { recipe, loading, error, refresh } = useRecipeDetail(recipeId);
  const [servingModal, setServingModal] = useState(false);
  const [editServing, setEditServing] = useState<RecipeServingOption | null>(null);
  const s = styles(colors);

  const invalidateRecipe = () => {
    queryClient.invalidateQueries({ queryKey: QK.recipe(recipeId) });
    queryClient.invalidateQueries({ queryKey: QK.recipes() });
  };

  const handleDeleteIngredient = useCallback(async (ingredient: { id: string }) => {
    try {
      await deleteRecipeIngredient(recipeId, ingredient.id);
      invalidateRecipe();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to remove ingredient');
    }
  }, [recipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteServing = useCallback(async (option: RecipeServingOption) => {
    try {
      await deleteRecipeServingOption(recipeId, option.id);
      invalidateRecipe();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to remove serving option');
    }
  }, [recipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEditServing = (option: RecipeServingOption) => {
    setEditServing(option);
    setServingModal(true);
  };

  const openAddServing = () => {
    setEditServing(null);
    setServingModal(true);
  };

  if (loading && !recipe) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.loadingCenter}>
          <Text style={s.errorText}>{error ?? 'Recipe not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md }}>
            <Text style={{ color: colors.primary }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Nav bar */}
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>{recipe.name}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecipeEditor', { recipeId })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Name + notes */}
        <View style={s.section}>
          <Text style={s.recipeName}>{recipe.name}</Text>
          {recipe.notes != null && recipe.notes.length > 0 && (
            <Text style={s.recipeNotes}>{recipe.notes}</Text>
          )}
        </View>

        {/* Nutrition totals */}
        {recipe.nutrition != null && (
          <RecipeTotalsCard nutrition={recipe.nutrition} />
        )}

        {/* Ingredients */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>Ingredients ({recipe.ingredients.length})</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('RecipeIngredientPicker', { recipeId })}
          >
            <Text style={s.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {recipe.ingredients.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyRowText}>No ingredients yet — tap + Add to build this recipe.</Text>
            </View>
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
          <TouchableOpacity onPress={openAddServing}>
            <Text style={s.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {recipe.servingOptions.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyRowText}>No serving options — add at least one to log this recipe.</Text>
            </View>
          ) : (
            recipe.servingOptions.map(opt => (
              <RecipeServingOptionRow
                key={opt.id}
                option={opt}
                onEdit={openEditServing}
                onDelete={handleDeleteServing}
              />
            ))
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <ServingOptionEditorModal
        visible={servingModal}
        recipeId={recipeId}
        editOption={editServing}
        onClose={() => setServingModal(false)}
        onSaved={invalidateRecipe}
      />
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
    editLink: { fontSize: Typography.base, color: colors.primary, fontWeight: Typography.medium, width: 60, textAlign: 'right' },
    loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: colors.error, fontSize: Typography.base, textAlign: 'center' },
    content: { padding: Spacing.md },
    section: { marginBottom: Spacing.md },
    recipeName: { fontSize: Typography.xl, fontWeight: Typography.bold, color: colors.textPrimary, marginBottom: 4 },
    recipeNotes: { fontSize: Typography.base, color: colors.textSecondary, lineHeight: Typography.base * 1.5 },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: Spacing.sm, marginTop: Spacing.sm,
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
  });
