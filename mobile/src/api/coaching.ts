import apiClient from './client';
import {
  CoachTraineeLinkResponse,
  InviteTraineeRequest,
  TraineeSummaryResponse,
  TraineeCoachResponse,
  LinkStatus,
} from '../types/coaching';

// ─── Coach endpoints ───────────────────────────────────────────────────────────

export async function getCoachTrainees(): Promise<CoachTraineeLinkResponse[]> {
  const res = await apiClient.get('/coach/trainees');
  const data = res.data.data;
  const list = Array.isArray(data) ? data : (data?.content ?? data?.trainees ?? []);
  return list.map(mapLink);
}

export async function inviteTrainee(payload: InviteTraineeRequest): Promise<CoachTraineeLinkResponse> {
  const res = await apiClient.post('/coach/invite', payload);
  return mapLink(res.data.data);
}

export async function getTraineeSummary(traineeId: string): Promise<TraineeSummaryResponse> {
  const res = await apiClient.get(`/coach/trainees/${traineeId}/summary`);
  return mapSummary(res.data.data);
}

// ─── Trainee endpoints ────────────────────────────────────────────────────────

export async function getMyCoach(): Promise<TraineeCoachResponse | null> {
  try {
    const res = await apiClient.get('/trainee/coach');
    const data = res.data.data;
    if (!data) return null;
    return mapCoachLink(data);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function normalizeStatus(raw: any): LinkStatus {
  const s = String(raw ?? '').toUpperCase();
  if (s === 'ACTIVE' || s === 'PENDING' || s === 'DECLINED' || s === 'REMOVED') {
    return s as LinkStatus;
  }
  return 'ACTIVE';
}

function mapLink(raw: any): CoachTraineeLinkResponse {
  return {
    id: raw.id ?? raw.link_id ?? raw.linkId,
    traineeId: raw.trainee_id ?? raw.traineeId ?? raw.userId,
    traineeName: raw.trainee_name ?? raw.traineeName ?? raw.name ?? null,
    traineeEmail: raw.trainee_email ?? raw.traineeEmail ?? raw.email ?? '',
    status: normalizeStatus(raw.status ?? raw.link_status ?? raw.linkStatus),
    linkedAt: raw.linked_at ?? raw.linkedAt ?? null,
    invitedAt: raw.invited_at ?? raw.invitedAt ?? raw.created_at ?? null,
  };
}

function mapSummary(raw: any): TraineeSummaryResponse {
  const w = raw.weight_snapshot ?? raw.weightSnapshot ?? raw.weight ?? null;
  const n = raw.nutrition_snapshot ?? raw.nutritionSnapshot ?? raw.nutrition ?? null;
  const b = raw.budget_snapshot ?? raw.budgetSnapshot ?? raw.budget ?? null;

  return {
    traineeId: raw.trainee_id ?? raw.traineeId ?? raw.userId,
    traineeName: raw.trainee_name ?? raw.traineeName ?? raw.name ?? null,
    traineeEmail: raw.trainee_email ?? raw.traineeEmail ?? raw.email ?? '',
    linkedAt: raw.linked_at ?? raw.linkedAt ?? null,
    status: normalizeStatus(raw.status ?? raw.link_status ?? raw.linkStatus),
    weightSnapshot: w ? {
      latestWeightKg: w.latest_weight_kg ?? w.latestWeightKg ?? w.latest_weight ?? w.latestWeight ?? null,
      weightUnit: w.weight_unit ?? w.weightUnit ?? null,
      changeFrom7DayKg: w.change_7_day ?? w.change7Day ?? w.change_from_7day_kg ?? null,
      changeFrom30DayKg: w.change_30_day ?? w.change30Day ?? w.change_from_30day_kg ?? null,
      totalLogs: w.total_logs ?? w.totalLogs ?? 0,
      lastLoggedAt: w.last_logged_at ?? w.lastLoggedAt ?? null,
    } : null,
    nutritionSnapshot: n ? {
      averageDailyCalories: n.average_daily_calories ?? n.averageDailyCalories ?? null,
      averageDailyProteinG: n.average_daily_protein_g ?? n.averageDailyProteinG ?? null,
      averageDailyCarbsG: n.average_daily_carbs_g ?? n.averageDailyCarbsG ?? null,
      averageDailyFatG: n.average_daily_fat_g ?? n.averageDailyFatG ?? null,
      lastDiaryDate: n.last_diary_date ?? n.lastDiaryDate ?? null,
      loggingStreakDays: n.logging_streak_days ?? n.loggingStreakDays ?? null,
      daysLoggedLast7: n.days_logged_last_7 ?? n.daysLoggedLast7 ?? null,
    } : null,
    budgetSnapshot: b ? {
      averageDailySpendPhp: b.average_daily_spend_php ?? b.averageDailySpendPhp ?? null,
      daysOverBudgetLast7: b.days_over_budget_last_7 ?? b.daysOverBudgetLast7 ?? null,
      budgetLimitPhp: b.budget_limit_php ?? b.budgetLimitPhp ?? null,
    } : null,
  };
}

function mapCoachLink(raw: any): TraineeCoachResponse {
  return {
    id: raw.id ?? raw.link_id ?? raw.linkId,
    coachId: raw.coach_id ?? raw.coachId,
    coachName: raw.coach_name ?? raw.coachName ?? raw.name ?? null,
    coachEmail: raw.coach_email ?? raw.coachEmail ?? raw.email ?? '',
    status: normalizeStatus(raw.status ?? raw.link_status ?? raw.linkStatus),
    linkedAt: raw.linked_at ?? raw.linkedAt ?? null,
    invitedAt: raw.invited_at ?? raw.invitedAt ?? null,
  };
}
