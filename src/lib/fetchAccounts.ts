'use server';

import { Account, CreateAccountBody } from '@interface';
import { BASE_URL } from '@constant';
import { revalidateTag } from 'next/cache';

/**
 * Server-fetching the list of accounts of the user.
 * Cache the result for an hour, except being revalidated
 */
export async function fetchAccounts(): Promise<Account[]> {
  try {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 60 * 60,
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

/**
 * Create the account and then revalidate the account list
 */
export async function createAccount(
  formData: CreateAccountBody,
): Promise<Account> {
  try {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        acc_number: Number(formData.acc_number),
        balance: Number(formData.balance),
        credit_limit: formData.credit_limit
          ? Number(formData.credit_limit)
          : null,
      }),
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    revalidateTag('fetch-accounts', { expire: 0 });

    return resData.data as Account;
  } catch (error) {
    throw error;
  }
}
