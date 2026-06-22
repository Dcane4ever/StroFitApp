import { ServingUnit } from './food';

export type BarcodeLookupStatus = 'FOUND_LOCAL' | 'FOUND_ENRICHED' | 'NOT_FOUND';

export interface BarcodeLookupResponse {
  barcode: string;
  status: BarcodeLookupStatus;
  foundLocally: boolean;
  enrichedExternally: boolean;
  message: string | null;
  // Present when status !== NOT_FOUND
  foodItemId: string | null;
  brandedProductId: string | null;
  foodName: string | null;
  brandName: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingUnits: ServingUnit[];
}
