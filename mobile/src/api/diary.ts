import apiClient from './client';
import { DiaryDayResponse, DiaryItemResponse, AddDiaryItemRequest, AddDiaryRecipeRequest } from '../types/diary';

export async function getDiaryByDate(date: string): Promise<DiaryDayResponse> {
  const res = await apiClient.get('/diary', { params: { date } });
  return res.data.data as DiaryDayResponse;
}

export async function addDiaryItem(payload: AddDiaryItemRequest): Promise<DiaryItemResponse> {
  const res = await apiClient.post('/diary/items', payload);
  return res.data.data as DiaryItemResponse;
}

export async function addDiaryRecipe(payload: AddDiaryRecipeRequest): Promise<DiaryItemResponse> {
  const res = await apiClient.post('/diary/items/recipe', payload);
  return res.data.data as DiaryItemResponse;
}
