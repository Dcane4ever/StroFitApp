import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { useRecipes } from '../../hooks/queries/useRecipes';
import { formatContextDate } from '../../utils/date';
import { getFoodDetail } from '../../api/food';
import { getRecipeDetail } from '../../api/recipe';
import { FoodSearchResult } from '../../types/food';
import { RecipeSummary } from '../../types/recipe';
import FoodSearchBar from '../../components/food/FoodSearchBar';
import FoodSearchResultRow from '../../components/food/FoodSearchResultRow';

type Props = MainTabScreenProps<'Search'>;

type Tab = 'food' | 'recipe';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export default function SearchScreen({ route, navigation }: Props) {
  const { colors } = useThemeStore();
  const context = route.params;
  const s = styles(colors);

  const [activeTab, setActiveTab] = useState<Tab>('food');
  const [detailLoading, setDetailLoading] = useState(false);

  const { results: foodResults, loading: foodLoading, error: foodError, query, setQuery } = useFoodSearch();
  const { recipes, loading: recipesLoading } = useRecipes();

  const handleScanBarcode = useCallback(() => {
    if (!context) return;
    navigation.navigate('BarcodeScanner', { date: context.date, mealType: context.mealType });
  }, [context, navigation]);

  const handleSelectFood = useCallback(async (item: FoodSearchResult) => {
    if (!context) {
      // Search opened without diary context — no logging destination; show info
      return;
    }
    setDetailLoading(true);
    try {
      const detail = await getFoodDetail(item.foodItemId);
      navigation.navigate('LogFood', {
        food: detail,
        date: context.date,
        mealType: context.mealType,
      });
    } catch {
      navigation.navigate('LogFood', {
        food: {
          foodItemId: item.foodItemId,
          foodName: item.foodName,
          brandName: item.brandName,
          brandedProductId: item.brandedProductId,
          source: item.source,
          servingUnits: [],
          caloriesPer100g: item.caloriesPer100g,
          proteinPer100g: item.proteinPer100g,
          carbsPer100g: item.carbsPer100g,
          fatPer100g: item.fatPer100g,
          fiberPer100g: null,
        },
        date: context.date,
        mealType: context.mealType,
      });
    } finally {
      setDetailLoading(false);
    }
  }, [context, navigation]);

  const handleSelectRecipe = useCallback(async (summary: RecipeSummary) => {
    if (!context) {
      return;
    }
    setDetailLoading(true);
    try {
      const detail = await getRecipeDetail(summary.id);
      navigation.navigate('LogRecipe', {
        recipe: detail,
        date: context.date,
        mealType: context.mealType,
      });
    } catch {
      // No fallback for recipe — need detail for serving options
    } finally {
      setDetailLoading(false);
    }
  }, [context, navigation]);

  // Filter recipes by query when a search term is active
  const filteredRecipes = query.trim().length >= 2
    ? recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : recipes;

  const renderFoodEmpty = () => {
    if (foodLoading) return null;
    if (query.length < 2) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>Search for food</Text>
          <Text style={s.emptySubtitle}>Try "rice", "tinola", "bangus" — Filipino foods included</Text>
        </View>
      );
    }
    if (foodError) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyTitle}>Search failed</Text>
          <Text style={s.emptySubtitle}>{foodError}</Text>
        </View>
      );
    }
    return (
      <View style={s.emptyState}>
        <Text style={s.emptyTitle}>No results for "{query}"</Text>
        <Text style={s.emptySubtitle}>Try a different spelling, or check your Recipes tab</Text>
      </View>
    );
  };

  const renderRecipeEmpty = () => {
    if (recipesLoading) {
      return (
        <View style={s.emptyState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (filteredRecipes.length === 0 && query.trim().length >= 2) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyTitle}>No recipes matching "{query}"</Text>
          <Text style={s.emptySubtitle}>Create recipes in My Recipes to log them here</Text>
        </View>
      );
    }
    if (recipes.length === 0) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>No recipes yet</Text>
          <Text style={s.emptySubtitle}>Create recipes in My Recipes to log them into your diary</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={s.root}>
      {context ? (
        <View style={s.contextHeader}>
          <Text style={s.contextTitle}>
            Adding to <Text style={{ color: colors.primary }}>{MEAL_LABELS[context.mealType] ?? context.mealType}</Text>
          </Text>
          <Text style={s.contextDate}>{formatContextDate(context.date)}</Text>
        </View>
      ) : (
        <View style={s.noContextBanner}>
          <Text style={s.noContextText}>Open from a meal section in your diary to log food or recipes.</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'food' && s.tabActive]}
          onPress={() => setActiveTab('food')}
        >
          <Text style={[s.tabText, activeTab === 'food' && s.tabTextActive]}>Foods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'recipe' && s.tabActive]}
          onPress={() => setActiveTab('recipe')}
        >
          <Text style={[s.tabText, activeTab === 'recipe' && s.tabTextActive]}>
            My Recipes {recipes.length > 0 ? `(${recipes.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search row */}
      <View style={s.searchRow}>
        <View style={s.searchBarWrap}>
          <FoodSearchBar
            value={query}
            onChangeText={setQuery}
            loading={activeTab === 'food' ? foodLoading : false}
            autoFocus
            placeholder={activeTab === 'food' ? 'Search foods…' : 'Filter recipes…'}
          />
        </View>
        {context && activeTab === 'food' && (
          <TouchableOpacity style={s.scanBtn} onPress={handleScanBarcode} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
            <Text style={s.scanIcon}>📷</Text>
            <Text style={s.scanLabel}>Scan</Text>
          </TouchableOpacity>
        )}
      </View>

      {detailLoading && (
        <View style={s.detailLoadingBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.detailLoadingText}>Loading details…</Text>
        </View>
      )}

      {/* Food tab */}
      {activeTab === 'food' && (
        <FlatList
          data={foodResults}
          keyExtractor={item => item.foodItemId}
          renderItem={({ item }) => (
            <FoodSearchResultRow item={item} onPress={handleSelectFood} />
          )}
          ListEmptyComponent={renderFoodEmpty}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={foodResults.length === 0 ? s.emptyListContent : undefined}
        />
      )}

      {/* Recipe tab */}
      {activeTab === 'recipe' && (
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.recipeRow}
              onPress={() => handleSelectRecipe(item)}
              activeOpacity={0.75}
            >
              <View style={s.recipeIcon}>
                <Text style={s.recipeIconText}>📋</Text>
              </View>
              <View style={s.recipeInfo}>
                <Text style={s.recipeName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.recipeMeta}>
                  {item.ingredientCount} ingredients
                  {item.nutrition ? `  ·  ${item.nutrition.totalCalories.toFixed(0)} kcal total` : ''}
                  {item.servingOptionCount > 0 ? `  ·  ${item.servingOptionCount} serving option${item.servingOptionCount > 1 ? 's' : ''}` : ''}
                </Text>
              </View>
              <Text style={s.recipeChevron}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={renderRecipeEmpty}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={filteredRecipes.length === 0 ? s.emptyListContent : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    noContextBanner: {
      marginHorizontal: Spacing.md,
      marginTop: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: Spacing.sm,
    },
    noContextText: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      textAlign: 'center',
    },
    contextHeader: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xs,
    },
    contextTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    contextDate: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      gap: Spacing.xs,
    },
    tab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      fontWeight: Typography.medium,
    },
    tabTextActive: {
      color: '#fff',
      fontWeight: Typography.semibold,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: Spacing.md,
    },
    searchBarWrap: { flex: 1 },
    scanBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    scanIcon: { fontSize: 22, color: colors.primary },
    scanLabel: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: Typography.semibold,
      letterSpacing: 0.4,
    },
    detailLoadingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: colors.primary + '18',
    },
    detailLoadingText: {
      fontSize: Typography.sm,
      color: colors.primary,
    },
    emptyListContent: { flexGrow: 1 },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxxl,
    },
    emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
    emptyTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    emptySubtitle: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.sm * 1.5,
    },
    recipeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: Spacing.sm,
    },
    recipeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recipeIconText: { fontSize: 18 },
    recipeInfo: { flex: 1 },
    recipeName: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    recipeMeta: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recipeChevron: {
      fontSize: Typography.xl,
      color: colors.textDisabled,
      lineHeight: Typography.xl,
    },
  });
