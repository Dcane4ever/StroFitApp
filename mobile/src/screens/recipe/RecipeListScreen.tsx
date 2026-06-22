import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RecipeStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useRecipes } from '../../hooks/queries/useRecipes';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { deleteRecipe } from '../../api/recipe';
import { RecipeSummary } from '../../types/recipe';
import RecipeCard from '../../components/recipe/RecipeCard';
import RecipeEmptyState from '../../components/recipe/RecipeEmptyState';

type Props = RecipeStackScreenProps<'RecipeList'>;

export default function RecipeListScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const { recipes, loading, error, refresh } = useRecipes();
  const s = styles(colors);

  useFocusEffect(useCallback(() => { refresh(); }, [])); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => navigation.navigate('RecipeEditor', {});

  const handlePress = (recipe: RecipeSummary) =>
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });

  const handleLongPress = (recipe: RecipeSummary) => {
    Alert.alert(recipe.name, 'What would you like to do?', [
      { text: 'Edit', onPress: () => navigation.navigate('RecipeEditor', { recipeId: recipe.id }) },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecipe(recipe.id);
            queryClient.invalidateQueries({ queryKey: QK.recipes() });
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete recipe');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isEmpty = !loading && recipes.length === 0;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>My Recipes</Text>
        <TouchableOpacity style={s.createBtn} onPress={handleCreate}>
          <Text style={s.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading && recipes.length === 0 ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isEmpty ? (
        <RecipeEmptyState onCreateFirst={handleCreate} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={r => r.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.8}
            >
              <RecipeCard recipe={item} onPress={handlePress} />
            </TouchableOpacity>
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            error != null ? (
              <View style={s.errorBanner}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    back: { fontSize: Typography.base, color: colors.primary, fontWeight: Typography.medium, width: 60 },
    title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: colors.textPrimary },
    createBtn: {
      backgroundColor: colors.primary, borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.md, paddingVertical: 5,
    },
    createBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: colors.textInverse },
    loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: Spacing.md },
    errorBanner: {
      backgroundColor: colors.error + '22', borderRadius: BorderRadius.md,
      padding: Spacing.sm, marginBottom: Spacing.sm,
    },
    errorText: { color: colors.error, fontSize: Typography.sm },
  });
