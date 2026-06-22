import apiClient from './client';
import { BarcodeLookupResponse } from '../types/barcode';
import { ServingUnit } from '../types/food';

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResponse> {
  const res = await apiClient.get(`/barcodes/${barcode}`);
  return mapToBarcodeLookupResponse(res.data.data, barcode);
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapToBarcodeLookupResponse(raw: any, barcode: string): BarcodeLookupResponse {
  // Backend BarcodeLookupResponse shape:
  // { barcode, lookupStatus (FOUND_LOCAL/FOUND_ENRICHED/NOT_FOUND),
  //   foodItemId, brandedProductId, foodName, brandName,
  //   nutrition: { caloriesPer100g, proteinGPer100g, carbsGPer100g, fatGPer100g, fiberGPer100g },
  //   servingUnits: [...] }

  const nutrition = raw.nutrition ?? {};
  const status = raw.lookup_status ?? raw.lookupStatus ?? raw.status ?? 'NOT_FOUND';
  const servingUnits: ServingUnit[] = (raw.serving_units ?? raw.servingUnits ?? []).map(mapServing);

  return {
    barcode: raw.barcode ?? barcode,
    status: normalizeStatus(status),
    foundLocally: status === 'FOUND_LOCAL' || raw.found_locally === true || raw.foundLocally === true,
    enrichedExternally: status === 'FOUND_ENRICHED' || raw.enriched_externally === true || raw.enrichedExternally === true,
    message: raw.message ?? null,
    foodItemId: raw.food_item_id ?? raw.foodItemId ?? null,
    brandedProductId: raw.branded_product_id ?? raw.brandedProductId ?? null,
    foodName: raw.food_name ?? raw.foodName ?? null,
    brandName: raw.brand_name ?? raw.brandName ?? null,
    caloriesPer100g: nutrition.calories_per_100g ?? nutrition.caloriesPer100g ?? raw.calories_per_100g ?? null,
    proteinPer100g: nutrition.protein_g_per_100g ?? nutrition.proteinGPer100g ?? raw.protein_g_per_100g ?? null,
    carbsPer100g: nutrition.carbs_g_per_100g ?? nutrition.carbsGPer100g ?? raw.carbs_g_per_100g ?? null,
    fatPer100g: nutrition.fat_g_per_100g ?? nutrition.fatGPer100g ?? raw.fat_g_per_100g ?? null,
    fiberPer100g: nutrition.fiber_g_per_100g ?? nutrition.fiberGPer100g ?? raw.fiber_g_per_100g ?? null,
    servingUnits,
  };
}

function normalizeStatus(raw: string): BarcodeLookupResponse['status'] {
  const upper = raw.toUpperCase();
  if (upper.includes('LOCAL')) return 'FOUND_LOCAL';
  if (upper.includes('ENRICH')) return 'FOUND_ENRICHED';
  return 'NOT_FOUND';
}

function mapServing(raw: any): ServingUnit {
  return {
    id: raw.id ?? raw.serving_unit_id ?? raw.servingUnitId,
    label: raw.label ?? raw.serving_label ?? raw.servingLabel,
    gramsEquivalent: raw.grams_equivalent ?? raw.gramsEquivalent ?? null,
    quantityPerUnit: raw.quantity_per_unit ?? raw.quantityPerUnit ?? null,
    unitType: raw.unit_type ?? raw.unitType ?? null,
  };
}
