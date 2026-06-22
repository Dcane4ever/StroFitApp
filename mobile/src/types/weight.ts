export type WeightUnit = 'KG' | 'LBS';

export interface WeightLog {
  id: string;
  weightValue: number;
  weightUnit: WeightUnit;
  loggedAt: string;   // ISO date-time
  notes: string | null;
}

export interface WeightProgressSummaryResponse {
  latestWeight: number | null;
  weightUnit: WeightUnit;
  previousWeight: number | null;
  changeFromPrevious: number | null;
  change7Day: number | null;
  change30Day: number | null;
  totalLogs: number;
  oldestLogDate: string | null;
  latestLogDate: string | null;
  goalWeightKg: number | null;
}

export interface AddWeightLogRequest {
  weightValue: number;
  weightUnit: WeightUnit;
  loggedAt: string;   // ISO date-time or date string
  notes?: string | null;
}

export interface UpdateWeightLogRequest {
  weightValue: number;
  weightUnit: WeightUnit;
  loggedAt: string;
  notes?: string | null;
}
