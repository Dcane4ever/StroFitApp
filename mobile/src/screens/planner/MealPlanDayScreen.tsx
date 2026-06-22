import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { PlannerStackScreenProps } from '../../types/navigation';
import { MealType } from '../../types/diary';
import { MealPlanItem } from '../../types/mealPlan';
import { useMealPlanDay } from '../../hooks/queries/useMealPlanDay';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { createMealPlan, deleteMealPlanItem } from '../../api/mealPlan';
import { addDiaryItem, addDiaryRecipe } from '../../api/diary';
import { formatLongDate } from '../../utils/date';
import MealPlanMealSection from '../../components/planner/MealPlanMealSection';
import MealPlanTotalsCard from '../../components/planner/MealPlanTotalsCard';

type Props = PlannerStackScreenProps<'MealPlanDay'>;

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function MealPlanDayScreen({ route, navigation }: Props) {
  const { date } = route.params;
  const { colors } = useThemeStore();
  const s = styles(colors);

  const { plan, loading, error, refresh } = useMealPlanDay(date);
  const [creating, setCreating] = useState(false);
  const [loggingItemId, setLoggingItemId] = useState<string | null>(null);
  const [lastLoggedName, setLastLoggedName] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleCreatePlan = async () => {
    setCreating(true);
    try {
      await createMealPlan({ planDate: date });
      refresh();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to create meal plan');
    } finally {
      setCreating(false);
    }
  };

  const handleAddItem = (planId: string, mealType: MealType) => {
    navigation.navigate('MealPlanEditor', { planId, date, mealType });
  };

  const handleDeleteItem = async (item: MealPlanItem) => {
    if (!plan) return;
    Alert.alert(
      'Remove Item',
      `Remove "${item.foodName}" from plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMealPlanItem(plan.id, item.id);
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Failed to remove item');
            }
          },
        },
      ],
    );
  };

  const handleLogItem = async (item: MealPlanItem) => {
    setLoggingItemId(item.id);
    try {
      if (item.recipeId && item.servingUnitId) {
        // Recipe item — log via recipe diary endpoint
        await addDiaryRecipe({
          date,
          mealType: item.mealType,
          recipeId: item.recipeId,
          servingOptionId: item.servingUnitId,
          quantity: item.quantity,
        });
      } else if (item.foodItemId && item.servingUnitId) {
        // Food item
        await addDiaryItem({
          date,
          mealType: item.mealType,
          foodItemId: item.foodItemId,
          servingUnitId: item.servingUnitId,
          quantity: item.quantity,
        });
      } else if (item.foodItemId) {
        // Food with no serving unit — log with empty servingUnitId (backend fallback)
        await addDiaryItem({
          date,
          mealType: item.mealType,
          foodItemId: item.foodItemId,
          servingUnitId: '',
          quantity: item.quantity,
        });
      } else {
        Alert.alert('Cannot log', 'This planned item does not have enough data to log automatically.');
        return;
      }
      // Invalidate diary cache so HomeScreen shows the newly logged item
      queryClient.invalidateQueries({ queryKey: QK.diary(date) });
      queryClient.invalidateQueries({ queryKey: QK.dailyBudget(date) });
      setLastLoggedName(item.foodName);
      setTimeout(() => setLastLoggedName(null), 2500);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to log item');
    } finally {
      setLoggingItemId(null);
    }
  };

  const mealsToShow = plan
    ? MEAL_ORDER.map(mt => {
        const found = plan.meals.find(m => m.mealType === mt);
        return found ?? { mealType: mt, items: [], totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, totalCostPhp: null };
      })
    : [];

  return (
    <View style={s.screen}>
      <View style={s.dateHeader}>
        <Text style={s.dateText}>{formatLongDate(date)}</Text>
      </View>

      {lastLoggedName != null && (
        <View style={s.loggedBanner}>
          <Text style={s.loggedBannerText}>✓ "{lastLoggedName}" added to diary</Text>
        </View>
      )}

      {loading && (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={s.retryBtn}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && !plan && (
        <View style={s.centered}>
          <Text style={s.emptyTitle}>No Meal Plan Yet</Text>
          <Text style={s.emptyHint}>Plan your meals ahead — add foods and recipes, then log them to your diary when you eat.</Text>
          <TouchableOpacity
            style={[s.createBtn, { backgroundColor: colors.primary }]}
            onPress={handleCreatePlan}
            disabled={creating}
          >
            {creating
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.createBtnText}>Create Meal Plan</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && plan && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <MealPlanTotalsCard plan={plan} />

          {mealsToShow.map(group => (
            <MealPlanMealSection
              key={group.mealType}
              group={group}
              onAddItem={() => handleAddItem(plan.id, group.mealType)}
              onDeleteItem={handleDeleteItem}
              onLogItem={handleLogItem}
              loggingItemId={loggingItemId}
            />
          ))}
        </ScrollView>
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
    dateHeader: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    dateText: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    loggedBanner: {
      backgroundColor: colors.primary + '22',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
    },
    loggedBannerText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: Spacing.sm,
    },
    errorText: {
      fontSize: Typography.sm,
      color: colors.error,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    retryText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
    emptyTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    emptyHint: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    createBtn: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: 10,
      minWidth: 200,
      alignItems: 'center',
    },
    createBtnText: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: '#fff',
    },
    scroll: { flex: 1 },
    content: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
  });
