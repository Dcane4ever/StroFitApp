import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography } from '../../theme';
import { useDiaryDay } from '../../hooks/useDiaryDay';
import { useDailyBudget } from '../../hooks/useDailyBudget';
import { MealType } from '../../types/diary';
import DateSwitcher from '../../components/diary/DateSwitcher';
import MacroSummaryCard from '../../components/diary/MacroSummaryCard';
import BudgetSummaryCard from '../../components/diary/BudgetSummaryCard';
import MealSectionCard from '../../components/diary/MealSectionCard';

type Props = MainTabScreenProps<'Home'>;

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const [date, setDate] = useState(todayString);

  const diary = useDiaryDay(date);
  const budget = useDailyBudget(date);

  const isRefreshing = diary.loading || budget.loading;

  const handleRefresh = useCallback(() => {
    diary.refresh();
    budget.refresh();
  }, [diary, budget]);

  const handleAddFood = useCallback((mealType: MealType) => {
    navigation.navigate('Search', { date, mealType });
  }, [navigation, date]);

  const s = styles(colors);

  // Build full meal list — always show all 4 meals even if empty
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
            refreshing={isRefreshing && !diary.loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Macro card — always show, zeros if no data */}
        <MacroSummaryCard
          calories={diary.data?.totalCalories ?? 0}
          proteinG={diary.data?.totalProteinG ?? 0}
          carbsG={diary.data?.totalCarbsG ?? 0}
          fatG={diary.data?.totalFatG ?? 0}
          fiberG={diary.data?.totalFiberG ?? 0}
        />

        {/* Budget card — only show if data available */}
        {budget.data != null && budget.data.budgetLimitPhp != null && (
          <BudgetSummaryCard budget={budget.data} />
        )}

        {/* Error banner */}
        {diary.error != null && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{diary.error}</Text>
          </View>
        )}

        {/* Initial load spinner (first load only, not refresh) */}
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

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
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
    },
    errorText: {
      color: colors.error,
      fontSize: Typography.sm,
    },
    bottomPad: { height: Spacing.xl },
  });
