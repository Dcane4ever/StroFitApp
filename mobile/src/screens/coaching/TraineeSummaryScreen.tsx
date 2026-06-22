import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { CoachingStackScreenProps } from '../../types/navigation';
import { useTraineeSummary } from '../../hooks/queries/useTraineeSummary';
import { TraineeWeightSnapshot, TraineeNutritionSnapshot, TraineeBudgetSnapshot } from '../../types/coaching';
import TraineeSummaryHeader from '../../components/coaching/TraineeSummaryHeader';
import TraineeMetricCard from '../../components/coaching/TraineeMetricCard';

type Props = CoachingStackScreenProps<'TraineeSummary'>;

function formatWeight(kg: number | null, unit: string | null): string {
  if (kg == null) return '—';
  if (unit === 'LBS') return `${(kg * 2.20462).toFixed(1)} lbs`;
  return `${kg.toFixed(1)} kg`;
}

function formatChange(val: number | null): { text: string; color: string } | null {
  if (val == null) return null;
  const sign = val > 0 ? '+' : '';
  const color = val > 0 ? '#F44336' : val < 0 ? '#4CAF50' : '#9E9E9E';
  return { text: `${sign}${val.toFixed(1)} kg`, color };
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function buildWeightMetrics(w: TraineeWeightSnapshot, colors: any) {
  const change7 = formatChange(w.changeFrom7DayKg);
  const change30 = formatChange(w.changeFrom30DayKg);

  return [
    { label: 'Latest', value: formatWeight(w.latestWeightKg, w.weightUnit) },
    ...(change7 ? [{ label: '7-day change', value: change7.text, valueColor: change7.color }] : []),
    ...(change30 ? [{ label: '30-day change', value: change30.text, valueColor: change30.color }] : []),
    { label: 'Total logs', value: String(w.totalLogs) },
    { label: 'Last logged', value: formatDate(w.lastLoggedAt) },
  ];
}

function buildNutritionMetrics(n: TraineeNutritionSnapshot, colors: any) {
  const metrics = [];
  if (n.averageDailyCalories != null) {
    metrics.push({ label: 'Avg calories/day', value: `${n.averageDailyCalories.toFixed(0)} kcal` });
  }
  if (n.averageDailyProteinG != null) {
    metrics.push({ label: 'Avg protein', value: `${n.averageDailyProteinG.toFixed(1)}g`, valueColor: colors.protein });
  }
  if (n.averageDailyCarbsG != null) {
    metrics.push({ label: 'Avg carbs', value: `${n.averageDailyCarbsG.toFixed(1)}g`, valueColor: colors.carbs });
  }
  if (n.averageDailyFatG != null) {
    metrics.push({ label: 'Avg fat', value: `${n.averageDailyFatG.toFixed(1)}g`, valueColor: colors.fat });
  }
  if (n.loggingStreakDays != null) {
    metrics.push({ label: 'Logging streak', value: `${n.loggingStreakDays}d` });
  }
  if (n.daysLoggedLast7 != null) {
    metrics.push({
      label: 'Days logged (7d)',
      value: `${n.daysLoggedLast7}/7`,
      valueColor: n.daysLoggedLast7 >= 5 ? colors.success : n.daysLoggedLast7 >= 3 ? '#FFC107' : colors.error,
    });
  }
  if (n.lastDiaryDate) {
    metrics.push({ label: 'Last diary entry', value: formatDate(n.lastDiaryDate) });
  }
  return metrics;
}

function buildBudgetMetrics(b: TraineeBudgetSnapshot, colors: any) {
  const metrics = [];
  if (b.averageDailySpendPhp != null) {
    metrics.push({ label: 'Avg daily spend', value: `₱${b.averageDailySpendPhp.toFixed(2)}` });
  }
  if (b.budgetLimitPhp != null) {
    metrics.push({ label: 'Budget limit', value: `₱${b.budgetLimitPhp.toFixed(2)}` });
  }
  if (b.daysOverBudgetLast7 != null) {
    metrics.push({
      label: 'Days over budget (7d)',
      value: `${b.daysOverBudgetLast7}/7`,
      valueColor: b.daysOverBudgetLast7 === 0 ? colors.success : b.daysOverBudgetLast7 <= 2 ? '#FFC107' : colors.error,
    });
  }
  return metrics;
}

export default function TraineeSummaryScreen({ route, navigation }: Props) {
  const { traineeId, traineeName } = route.params;
  const { colors } = useThemeStore();
  const s = styles(colors);

  const { summary, loading, error, refresh } = useTraineeSummary(traineeId);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (loading && !summary) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={s.retryBtn}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!summary) return null;

  const weightMetrics = summary.weightSnapshot
    ? buildWeightMetrics(summary.weightSnapshot, colors)
    : null;

  const nutritionMetrics = summary.nutritionSnapshot
    ? buildNutritionMetrics(summary.nutritionSnapshot, colors)
    : null;

  const budgetMetrics = summary.budgetSnapshot
    ? buildBudgetMetrics(summary.budgetSnapshot, colors)
    : null;

  const hasAnyData = weightMetrics || nutritionMetrics || budgetMetrics;

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <TraineeSummaryHeader summary={summary} />

      {!hasAnyData && (
        <View style={s.noDataCard}>
          <Text style={s.noDataText}>No activity data available yet.</Text>
          <Text style={s.noDataHint}>
            This trainee hasn't logged any data, or the summary isn't ready.
          </Text>
        </View>
      )}

      {weightMetrics && weightMetrics.length > 0 && (
        <TraineeMetricCard
          title="Weight Progress"
          metrics={weightMetrics}
          accentColor={colors.info}
        />
      )}

      {nutritionMetrics && nutritionMetrics.length > 0 && (
        <TraineeMetricCard
          title="Nutrition & Diary"
          metrics={nutritionMetrics}
          accentColor={colors.calories}
        />
      )}

      {budgetMetrics && budgetMetrics.length > 0 && (
        <TraineeMetricCard
          title="Budget"
          metrics={budgetMetrics}
          accentColor={colors.primary}
        />
      )}

      {summary.weightSnapshot?.totalLogs === 0 && (
        <View style={s.tipCard}>
          <Text style={s.tipText}>
            💡 Encourage this trainee to log their weight regularly so you can track their progress over time.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: Typography.sm,
      color: colors.error,
      textAlign: 'center',
      paddingHorizontal: Spacing.xl,
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
      fontWeight: '500',
    },
    noDataCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    noDataText: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    noDataHint: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      textAlign: 'center',
    },
    tipCard: {
      backgroundColor: colors.primary + '12',
      borderRadius: 10,
      padding: Spacing.md,
      marginTop: Spacing.xs,
    },
    tipText: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      lineHeight: Typography.xs * 1.6,
    },
  });
