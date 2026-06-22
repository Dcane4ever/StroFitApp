import { MealType } from './diary';

export type LinkStatus = 'ACTIVE' | 'PENDING' | 'DECLINED' | 'REMOVED';

export interface CoachTraineeLinkResponse {
  id: string;
  traineeId: string;
  traineeName: string | null;
  traineeEmail: string;
  status: LinkStatus;
  linkedAt: string | null;
  invitedAt: string | null;
}

export interface InviteTraineeRequest {
  traineeEmail: string;
}

// ─── Trainee summary sub-shapes ───────────────────────────────────────────────

export interface TraineeWeightSnapshot {
  latestWeightKg: number | null;
  weightUnit: string | null;
  changeFrom7DayKg: number | null;
  changeFrom30DayKg: number | null;
  totalLogs: number;
  lastLoggedAt: string | null;
}

export interface TraineeNutritionSnapshot {
  averageDailyCalories: number | null;
  averageDailyProteinG: number | null;
  averageDailyCarbsG: number | null;
  averageDailyFatG: number | null;
  lastDiaryDate: string | null;
  loggingStreakDays: number | null;
  daysLoggedLast7: number | null;
}

export interface TraineeBudgetSnapshot {
  averageDailySpendPhp: number | null;
  daysOverBudgetLast7: number | null;
  budgetLimitPhp: number | null;
}

export interface TraineeSummaryResponse {
  traineeId: string;
  traineeName: string | null;
  traineeEmail: string;
  linkedAt: string | null;
  status: LinkStatus;
  weightSnapshot: TraineeWeightSnapshot | null;
  nutritionSnapshot: TraineeNutritionSnapshot | null;
  budgetSnapshot: TraineeBudgetSnapshot | null;
}

// ─── Trainee side ─────────────────────────────────────────────────────────────

export interface TraineeCoachResponse {
  id: string;
  coachId: string;
  coachName: string | null;
  coachEmail: string;
  status: LinkStatus;
  linkedAt: string | null;
  invitedAt: string | null;
}
