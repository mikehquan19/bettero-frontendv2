'use client';

import { Typography, Stack, Collapse, Button } from '@mui/material';
import ExpenseChange from '@/components/charts/ExpenseChange';
import ExpenseComposition from '@/components/charts/ExpenseComposition';
import TransactionTable from '@/components/transactions/TransactionTable';
import { AnalysisInfo, PaginatedData, Transaction } from '@/interface';
import useSWR from 'swr';
import { useState, useEffect, MouseEvent } from 'react';
import { BASE_URL, PageLimit } from '@/constant';

export default function Analysis(props: { analysisData: AnalysisInfo }) {
  const [category, setCategory] = useState<string | null>(null);
  const [transactionTableOpen, setTransactionTableOpen] =
    useState<boolean>(false);
  const [transactionsOffset, setTransactionsOffset] = useState<number>(0);

  const changeData = props.analysisData.change;
  const compositionData = props.analysisData.composition;

  // Client-fetching the transactions of the given category of this month
  const { data, isValidating } = useSWR(
    category ? { category, offset: transactionsOffset } : null,
    // The fetcher
    async (key: {
      category: string;
      offset: number;
    }): Promise<PaginatedData<Transaction[]>> => {
      try {
        const date = new Date();
        const firstDate = new Date(date.getFullYear(), date.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];

        let url = `${BASE_URL}/transactions?`;
        url += `category=${key.category}&start=${firstDate}&end=${lastDate}&offset=${key.offset}`;

        const res = await fetch(url, { method: 'GET' });
        const resData = await res.json();
        if (resData.error !== '') {
          throw new Error(resData.error);
        }

        const paginatedTrans: PaginatedData<Transaction[]> = {
          total: resData.data.total ?? 0,
          offset: resData.data.offset ?? 0,
          data: resData.data.data ?? [],
        };

        return paginatedTrans;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('An unknown error occurred');
        }
      }
    },
    {
      keepPreviousData: true, // To keep previous data while loading new one
    },
  );

  useEffect(() => {
    // If it's not open, open if initial data has been loaded.
    // Otherwise, close if button is clicked.
    if (!transactionTableOpen) {
      setTransactionTableOpen(category !== null && !isValidating);
    } else if (category == null) {
      setTransactionTableOpen(false);
    }
  }, [category, isValidating]);

  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    // If offset changes, useSWR should be able to re-fetch data
    setTransactionsOffset(newOffset);
  }

  return (
    <>
      {/* Spending analysis */}
      <Typography variant="h5" className="font-bold mb-1">
        Spending analysis this month
      </Typography>
      <Stack className="bg-blue-300 rounded-xl shadow-lg p-4">
        <Stack direction="row" className="justify-evenly">
          <ExpenseChange percentages={changeData} />
          <ExpenseComposition
            percentages={compositionData}
            onChangeCategory={(category) => setCategory(category)}
          />
        </Stack>

        {/* Collapsible transaction table */}
        <Collapse
          className="mt-8"
          in={transactionTableOpen}
          timeout="auto"
          unmountOnExit
        >
          <TransactionTable
            paginatedTransactions={data!}
            onPageChange={handlePageChange}
          />
          <div className="mt-2 flex flex-row justify-center">
            <Button
              variant="contained"
              className="bg-gray-400 font-bold rounded-lg"
              onClick={() => setCategory(null)}
            >
              Close
            </Button>
          </div>
        </Collapse>
      </Stack>
    </>
  );
}
