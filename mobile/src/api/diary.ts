import apiClient from './client';
import { DiaryDayResponse } from '../types/diary';

export async function getDiaryByDate(date: string): Promise<DiaryDayResponse> {
  const res = await apiClient.get('/diary', { params: { date } });
  return res.data.data as DiaryDayResponse;
}
