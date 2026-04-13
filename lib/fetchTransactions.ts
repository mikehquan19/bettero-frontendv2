import { APIResponse, Transaction } from '@/interface';

export async function fetchTransactions(
  offset: number,
  accountId: number | null,
): Promise<APIResponse<Transaction[]>> {
  try {
    let url = 'http://localhost:8080/';
    if (accountId !== null) {
      url += `accounts/${accountId}/`;
    }
    url += `transactions?offset=${offset}`;

    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    const transactionData = await res.json();
    return { error: transactionData.error, data: transactionData.data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    };
  }
}
