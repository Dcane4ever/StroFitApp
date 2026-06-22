import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { useDiaryDay } from '../../hooks/queries/useDiaryDay';
import { useDailyBudget } from '../../hooks/queries/useDailyBudget';
import { MealType } from '../../types/diary';
import { todayString, shiftDate } from '../../utils/date';
import DateSwitcher from '../../components/diary/DateSwitcher';
import MacroSummaryCard from '../../components/diary/MacroSummaryCard';
import BudgetSummaryCard from '../../components/diary/BudgetSummaryCard';
import MealSectionCard from '../../components/diary/MealSectionCard';

type Props = MainTabScreenProps<'Home'>;

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const [date, setDate] = useState(todayString);

  const diary = useDiaryDay(date);
  const budget = useDailyBudget(date);

  // Background refetch on screen focus — no spinner if cached data is present
  useFocusEffect(
    useCallback(() => {
      diary.refresh();
      budget.refresh();
    }, [date]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleRefresh = useCallback(() => {
    diary.refresh();
    budget.refresh();
  }, [diary, budget]);

  const s = styles(colors);

  const mealMap = new Map(diary.data?.meals.map(m => [m.mealType, m]));
  const allMeals = MEAL_ORDER.map(type => (
    mealMap.get(type) ?? {
      mealType: type,
      items: [],
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
      totalFiberG: 0,
      totalCost: null,
    }
  ));

  const handleAddFood = useCallback((mealType: MealType) => {
    navigation.navigate('Search', { date, mealType });
  }, [navigation, date]);

  // isRefreshing drives the pull-to-refresh spinner —
  // only show when both are fetching (covers initial load + manual refresh)
  const isRefreshing = diary.isRefetching || budget.loading;

  return (
    <SafeAreaView style={s.root}>
      <DateSwitcher
        date={date}
        onPrev={() => setDate(d => shiftDate(d, -1))}
        onNext={() => setDate(d => shiftDate(d, 1))}
        onToday={() => setDate(todayString())}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <MacroSummaryCard
          calories={diary.data?.totalCalories ?? 0}
          proteinG={diary.data?.totalProteinG ?? 0}
          carbsG={diary.data?.totalCarbsG ?? 0}
          fatG={diary.data?.totalFatG ?? 0}
          fiberG={diary.data?.totalFiberG ?? 0}
        />

        {budget.data != null && budget.data.budgetLimitPhp != null && (
          <BudgetSummaryCard budget={budget.data} />
        )}

        {/* Soft error banner — show even if cached diary data is present */}
        {diary.error != null && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{diary.error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={s.retryLink}>
              <Text style={s.retryLinkText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Initial load only (no cache yet) */}
        {diary.loading && diary.data == null ? (
          <View style={s.loadingCenter}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          allMeals.map(meal => (
            <MealSectionCard
              key={meal.mealType}
              meal={meal}
              onAddFood={handleAddFood}
            />
          ))
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingTop: Spacing.xs },
    loadingCenter: {
      paddingVertical: Spacing.xxxl,
      alignItems: 'center',
    },
    errorBanner: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      backgroundColor: colors.error + '22',
      borderRadius: 8,
      padding: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    errorText: {
      color: colors.error,
      fontSize: Typography.sm,
      flex: 1,
    },
    retryLink: { paddingLeft: Spacing.sm },
    retryLinkText: {
      color: colors.error,
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      textDecorationLine: 'underline',
    },
    bottomPad: { height: Spacing.xl },
  });
