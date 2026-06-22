import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { PlannerStackScreenProps } from '../../types/navigation';
import { useBudgetOverview } from '../../hooks/queries/useBudgetOverview';
import { todayString, shiftDate, formatShortDate, isToday } from '../../utils/date';
import BudgetOverviewCard from '../../components/planner/BudgetOverviewCard';
import BudgetTrendCard from '../../components/planner/BudgetTrendCard';
import MealCostBreakdownCard from '../../components/planner/MealCostBreakdownCard';

type Props = PlannerStackScreenProps<'BudgetOverview'>;

export default function BudgetOverviewScreen({ route, navigation }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const today = todayString();
  const [date, setDate] = useState(route.params?.date ?? today);

  const { daily, range, loading, error, refresh } = useBudgetOverview(date);

  useFocusEffect(
    React.useCallback(() => { refresh(); }, [refresh]),
  );

  const goDay = (offset: number) => setDate(d => shiftDate(d, offset));

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <TouchableOpacity style={s.navBtn} onPress={() => goDay(-1)}>
          <Text style={s.navText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDate(today)}>
          <Text style={s.dateText}>{isToday(date) ? 'Today' : formatShortDate(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={() => goDay(1)} disabled={date >= today}>
          <Text style={[s.navText, date >= today && { color: colors.textDisabled }]}>›</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && error && !daily && !range && (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={s.retryBtn}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {daily ? (
            <>
              <BudgetOverviewCard budget={daily} />
              {daily.mealBreakdown && daily.mealBreakdown.length > 0 && (
                <MealCostBreakdownCard budget={daily} />
              )}
            </>
          ) : (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No budget data for this day.</Text>
              <Text style={s.emptyHint}>Set a daily food budget in your profile to track spending here.</Text>
            </View>
          )}

          {range && <BudgetTrendCard range={range} />}

          <TouchableOpacity
            style={[s.plannerBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('MealPlanDay', { date })}
          >
            <Text style={s.plannerBtnText}>View Meal Plan for This Day</Text>
          </TouchableOpacity>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    navBtn: {
      padding: Spacing.sm,
      minWidth: 40,
      alignItems: 'center',
    },
    navText: {
      fontSize: Typography.xxl,
      color: colors.primary,
      lineHeight: Typography.xxl,
    },
    dateText: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
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
    scroll: { flex: 1 },
    content: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: Typography.md,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    emptyHint: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      textAlign: 'center',
    },
    plannerBtn: {
      marginTop: Spacing.sm,
      borderRadius: 10,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    plannerBtnText: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: '#fff',
    },
  });
