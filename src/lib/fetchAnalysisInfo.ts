'use server';

import { AnalysisInfo } from '@interface';
import { BASE_URL } from '@constant';

/**
 * Server-fetch the spending analysis data of the user between 2 dates.
 * Cache the result for an hour, except being revalidated
 */
export async function fetchAnalysisInfo(
  currStart: string,
  currEnd: string,
  prevStart: string,
  prevEnd: string,
): Promise<AnalysisInfo> {
  const res = await fetch(
    `${BASE_URL}/summary?curr_start=${currStart}&curr_end=${currEnd}&prev_start=${prevStart}&prev_end=${prevEnd}`,
    {
      method: 'GET',
      next: {
        revalidate: 60 * 60,
        tags: ['fetch-analysis'],
      },
    },
  );

  const resData = await res.json();
  if (resData.error !== '') {
    throw new Error(resData.error);
  }

  return {
    basic: resData.data.basic ?? {},
    daily: resData.data.daily ?? {},
    change: resData.data.change ?? {},
    composition: resData.data.composition ?? {},
  } as AnalysisInfo;
}
