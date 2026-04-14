import { APIResponse, Account } from '@/interface';

export const BASE_URL = 'http://localhost:8080';

export async function fetchAccounts(): Promise<APIResponse<Account[]>> {
  try {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'GET',
      next: { revalidate: 3600 },
    });

    const resData = await res.json();
    if (resData.error !== '') {
      return { error: resData.error, data: null };
    }
    return { error: resData.error, data: resData.data ?? [] };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    };
  }
}
