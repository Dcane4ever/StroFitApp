import apiClient from './client';
import {
  WeightLog,
  WeightProgressSummaryResponse,
  AddWeightLogRequest,
  UpdateWeightLogRequest,
} from '../types/weight';

export async function getWeightLogs(params?: { start?: string; end?: string }): Promise<WeightLog[]> {
  const res = await apiClient.get('/weights', { params });
  const data = res.data.data;
  // Handle both plain list and paginated response
  const items: any[] = Array.isArray(data) ? data : (data?.content ?? []);
  return items.map(mapLog);
}

export async function getWeightSummary(params?: { start?: string; end?: string }): Promise<WeightProgressSummaryResponse> {
  const res = await apiClient.get('/weights/summary', { params });
  return mapSummary(res.data.data);
}

export async function addWeightLog(payload: AddWeightLogRequest): Promise<WeightLog> {
  const res = await apiClient.post('/weights', payload);
  return mapLog(res.data.data);
}

export async function updateWeightLog(id: string, payload: UpdateWeightLogRequest): Promise<WeightLog> {
  const res = await apiClient.put(`/weights/${id}`, payload);
  return mapLog(res.data.data);
}

export async function deleteWeightLog(id: string): Promise<void> {
  await apiClient.delete(`/weights/${id}`);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapLog(raw: any): WeightLog {
  return {
    id: raw.id ?? raw.weight_log_id ?? raw.weightLogId,
    weightValue: raw.weight_value ?? raw.weightValue ?? raw.weight,
    weightUnit: raw.weight_unit ?? raw.weightUnit ?? 'KG',
    loggedAt: raw.logged_at ?? raw.loggedAt ?? raw.date,
    notes: raw.notes ?? null,
  };
}

function mapSummary(raw: any): WeightProgressSummaryResponse {
  return {
    latestWeight: raw.latest_weight ?? raw.latestWeight ?? null,
    weightUnit: raw.weight_unit ?? raw.weightUnit ?? 'KG',
    previousWeight: raw.previous_weight ?? raw.previousWeight ?? null,
    changeFromPrevious: raw.change_from_previous ?? raw.changeFromPrevious ?? null,
    change7Day: raw.change_7_day ?? raw.change7Day ?? null,
    change30Day: raw.change_30_day ?? raw.change30Day ?? null,
    totalLogs: raw.total_logs ?? raw.totalLogs ?? 0,
    oldestLogDate: raw.oldest_log_date ?? raw.oldestLogDate ?? null,
    latestLogDate: raw.latest_log_date ?? raw.latestLogDate ?? null,
    goalWeightKg: raw.goal_weight_kg ?? raw.goalWeightKg ?? null,
  };
}
