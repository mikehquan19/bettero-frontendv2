'use server';

import { PaginatedData, Transaction } from '@/interface';
import { BASE_URL } from '@/interface';
import {
  CreateTransactionBody,
  UpdateTransactionBody,
} from '@/components/transactions/TransactionForm';
import { revalidateTag } from 'next/cache';

/**
 * Server-fetch the list of latest transactions of user.
 */
export async function fetchTransactions(
  offset: number,
): Promise<PaginatedData<Transaction[]>> {
  try {
    const url = `${BASE_URL}/transactions?offset=${offset}`;
    const res = await fetch(url, {
      method: 'GET',
      next: {
        // Cache the result for an hour or when it is invalidated by update functions
        revalidate: 60 * 5,
        tags: ['fetch-transactions'],
      },
    });

    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    // Default paginated data
    const paginatedData: PaginatedData<Transaction[]> = {
      total: resData.data.total ?? 0,
      offset: resData.data.offset ?? 0,
      data: resData.data.data ?? [],
    };

    return paginatedData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function createTransaction(
  formData: CreateTransactionBody,
): Promise<Transaction> {
  try {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    revalidateTag('fetch-transactions', { expire: 0 });
    revalidateTag('fetch-accounts', { expire: 0 });

    return resData.data as Transaction;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function updateTransaction(
  id: number,
  formData: UpdateTransactionBody,
): Promise<Transaction> {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    revalidateTag('fetch-transactions', { expire: 0 });
    revalidateTag('fetch-accounts', { expire: 0 });

    return resData.data as Transaction;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function deleteTransaction(id: number): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    revalidateTag('fetch-transactions', { expire: 0 });
    revalidateTag('fetch-accounts', { expire: 0 });

    return resData.data as string;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}
