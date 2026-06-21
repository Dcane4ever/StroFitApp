import apiClient from './client';
import { DailyBudgetSummaryResponse } from '../types/budget';

export async function getDailyBudgetSummary(date: string): Promise<DailyBudgetSummaryResponse> {
  const res = await apiClient.get('/budget/daily', { params: { date } });
  return res.data.data as DailyBudgetSummaryResponse;
}
