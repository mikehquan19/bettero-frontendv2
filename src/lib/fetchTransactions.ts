'use server';

import { PaginatedData, Transaction } from '@interface';
import { BASE_URL } from '@constant';
import { CreateTransactionBody, UpdateTransactionBody } from '@interface';
import { revalidateTag } from 'next/cache';

/**
 * Server-fetch the list of latest transactions of user.
 */
export async function fetchTransactions(
  merchant: string | undefined,
  description: string | undefined,
  offset: number,
): Promise<PaginatedData<Transaction[]>> {
  try {
    let url = `${BASE_URL}/transactions?offset=${offset}`;
    if (merchant !== undefined) {
      url += `&merchant=${merchant}`;
    }
    if (description !== undefined) {
      url += `&description=${description}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: {
        // Cache the result for an hour or when it is invalidated by update functions
        revalidate: 60 * 30,
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
    throw error;
  }
}

export async function createTransaction(
  formData: CreateTransactionBody,
): Promise<Transaction> {
  try {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        account_id: Number(formData.account_id),
        amount: Number(formData.amount), // Put it in a number
      }),
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    for (const tag of [
      'fetch-transactions',
      'fetch-accounts',
      'fetch-analysis',
    ]) {
      revalidateTag(tag, { expire: 0 });
    }

    return resData.data as Transaction;
  } catch (error) {
    throw error;
  }
}

export async function updateTransaction(
  id: number,
  formData: UpdateTransactionBody,
): Promise<Transaction> {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        amount: Number(formData.amount), // Put it in a number
      }),
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    for (const tag of [
      'fetch-transactions',
      'fetch-accounts',
      'fetch-analysis',
    ]) {
      revalidateTag(tag, { expire: 0 });
    }

    return resData.data as Transaction;
  } catch (error) {
    throw error;
  }
}

export async function deleteTransaction(id: number): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    for (const tag of [
      'fetch-transactions',
      'fetch-accounts',
      'fetch-analysis',
    ]) {
      revalidateTag(tag, { expire: 0 });
    }

    return resData.data as string;
  } catch (error) {
    throw error;
  }
}
