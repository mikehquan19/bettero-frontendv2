import { APIResponse, PaginatedData, Transaction } from '@/interface';
import { BASE_URL } from './fetchAccounts';

export async function fetchTransactions(
  offset: number,
  accountId: number,
): Promise<APIResponse<PaginatedData<Transaction[]>>> {
  try {
    let transactionsUrl = BASE_URL;
    if (accountId != -1) {
      transactionsUrl += `/accounts/${accountId}`;
    }
    transactionsUrl += `/transactions?offset=${offset}`;

    const res = await fetch(transactionsUrl, {
      method: 'GET',
      next: { revalidate: 60 },
    });

    const resData = await res.json();
    if (resData.error !== '') {
      return { error: resData.error, data: null };
    }

    // Default paginated data
    const paginatedData: PaginatedData<Transaction[]> = {
      total: resData.data.total ?? 0,
      offset: resData.data.offset ?? 0,
      data: resData.data.data ?? [],
    };
    return { error: resData.error, data: paginatedData };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    };
  }
}
