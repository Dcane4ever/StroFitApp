import apiClient from './client';
import {
  DailyBudgetSummaryResponse,
  BudgetRangeSummaryResponse,
  DailySpendEntry,
} from '../types/budget';

export async function getDailyBudgetSummary(date: string): Promise<DailyBudgetSummaryResponse> {
  const res = await apiClient.get('/budget/daily', { params: { date } });
  return mapDailyBudget(res.data.data);
}

export async function getBudgetRangeSummary(
  start: string,
  end: string,
): Promise<BudgetRangeSummaryResponse> {
  const res = await apiClient.get('/budget/range', { params: { start, end } });
  return mapRangeSummary(res.data.data, start, end);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapDailyBudget(raw: any): DailyBudgetSummaryResponse {
  return {
    date: raw.date ?? '',
    budgetLimitPhp: raw.budget_limit_php ?? raw.budgetLimitPhp ?? raw.daily_budget_php ?? raw.dailyBudgetPhp ?? null,
    totalSpentPhp: raw.total_spent_php ?? raw.totalSpentPhp ?? raw.total_spent ?? 0,
    remainingPhp: raw.remaining_php ?? raw.remainingPhp ?? null,
    percentUsed: raw.percent_used ?? raw.percentUsed ?? null,
    mealBreakdown: (raw.meal_breakdown ?? raw.mealBreakdown ?? []).map((m: any) => ({
      mealType: m.meal_type ?? m.mealType,
      totalSpent: m.total_spent ?? m.totalSpent ?? 0,
    })),
  };
}

function mapRangeSummary(raw: any, start: string, end: string): BudgetRangeSummaryResponse {
  // Backend may return a list of daily summaries or a roll-up object
  // Handle both shapes
  if (Array.isArray(raw)) {
    return aggregateFromDailyList(raw, start, end);
  }
  const dailyEntries: DailySpendEntry[] = (
    raw.daily_entries ?? raw.dailyEntries ?? raw.daily_summaries ?? raw.dailySummaries ?? []
  ).map(mapDailyEntry);

  return {
    startDate: raw.start_date ?? raw.startDate ?? start,
    endDate: raw.end_date ?? raw.endDate ?? end,
    totalSpentPhp: raw.total_spent_php ?? raw.totalSpentPhp ?? 0,
    averageDailySpendPhp: raw.average_daily_spend_php ?? raw.averageDailySpendPhp ?? 0,
    daysOverBudget: raw.days_over_budget ?? raw.daysOverBudget ?? 0,
    totalDays: raw.total_days ?? raw.totalDays ?? dailyEntries.length,
    budgetLimitPhp: raw.budget_limit_php ?? raw.budgetLimitPhp ?? null,
    dailyEntries,
  };
}

function mapDailyEntry(raw: any): DailySpendEntry {
  const spent = raw.total_spent_php ?? raw.totalSpentPhp ?? raw.total_spent ?? 0;
  const limit = raw.budget_limit_php ?? raw.budgetLimitPhp ?? null;
  return {
    date: raw.date ?? '',
    totalSpentPhp: spent,
    budgetLimitPhp: limit,
    overBudget: limit != null && spent > limit,
  };
}

function aggregateFromDailyList(list: any[], start: string, end: string): BudgetRangeSummaryResponse {
  const entries = list.map(mapDailyEntry);
  const total = entries.reduce((s, e) => s + e.totalSpentPhp, 0);
  const overCount = entries.filter(e => e.overBudget).length;
  const limit = entries.find(e => e.budgetLimitPhp != null)?.budgetLimitPhp ?? null;
  return {
    startDate: start,
    endDate: end,
    totalSpentPhp: total,
    averageDailySpendPhp: entries.length > 0 ? total / entries.length : 0,
    daysOverBudget: overCount,
    totalDays: entries.length,
    budgetLimitPhp: limit,
    dailyEntries: entries,
  };
}
