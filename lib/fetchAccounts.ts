'use server';

import { Account } from '@/interface';
import { BASE_URL } from '@/constant';

/**
 * Server-fetching the list of accounts of the user.
 * Cache the result for an hour, except being revalidated
 */
export async function fetchAccounts(): Promise<Account[]> {
  try {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'GET',
      next: {
        revalidate: 60 * 5,
        tags: ['fetch-accounts'],
      },
    });

    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }
    return resData.data ?? [];
  } catch (error) {
    throw error;
  }
}
