'use client';

import { Typography, Stack, Collapse, Button, Tooltip } from '@mui/material';
import ExpenseChange from '@/src/components/charts/ExpenseChange';
import ExpenseComposition from '@/src/components/charts/ExpenseComposition';
import TransactionTable from '@/src/components/transactions/TransactionTable';
import { AnalysisInfo, PaginatedData, Transaction } from '@/src/interface';
import useSWR from 'swr';
import { useState, useEffect, MouseEvent } from 'react';
import { BASE_URL, PageLimit } from '@/src/constant';
import { getTime } from '@/src/lib/time';

/**
 * Button to close the collapse
 */
function CollapseButton(props: {
  className: string | undefined;
  onClick: () => void;
}) {
  return (
    <div className={props.className}>
      <Tooltip title="Hide the table">
        <Button
          variant="contained"
          className="bg-gray-400 font-bold rounded-lg"
          onClick={() => props.onClick()}
        >
          Close
        </Button>
      </Tooltip>
    </div>
  );
}

type transactionFetchKey = {
  category: string;
  offset: number;
};

export default function Analysis(props: { analysisData: AnalysisInfo }) {
  const [category, setCategory] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState<boolean>(false);
  const [transactionsOffset, setTransactionsOffset] = useState<number>(0);

  const changeData = props.analysisData.change;
  const compositionData = props.analysisData.composition;

  /**
   * Fetcher for client-fetching using useSWR
   */
  async function transactionFetcher(
    key: transactionFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    try {
      const [firstDate, lastDate] = getTime();

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
  }

  // Client-fetching the transactions of the given category of this month
  const { data, isValidating } = useSWR(
    category
      ? ({ category, offset: transactionsOffset } as transactionFetchKey)
      : null,
    transactionFetcher,
    {
      keepPreviousData: true, // To keep previous data while loading new one
    },
  );

  useEffect(() => {
    // If it's not open, open if initial data has been loaded.
    // Otherwise, close if button is clicked.
    if (!tableOpen) {
      setTableOpen(category !== null && !isValidating);
    } else if (category == null) {
      setTableOpen(false);
    }
  }, [category, isValidating, tableOpen]);

  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    // If offset changes, useSWR should be able to re-fetch data because key changes
    setTransactionsOffset(newOffset);
  }

  return (
    <>
      {/* Spending analysis */}
      <Typography
        variant="h6"
        className="bg-gray-400 font-bold p-2 rounded-t-xl text-white"
      >
        Spending analysis this month
      </Typography>
      <Stack className="bg-blue-300 rounded-b-xl shadow-lg p-4">
        <Stack direction="row" className="justify-evenly">
          <ExpenseChange percentages={changeData} />
          <ExpenseComposition
            percentages={compositionData}
            onChangeCategory={(category) => setCategory(category)}
          />
        </Stack>

        {/* Collapsible transaction table */}
        <Collapse className="mt-8" in={tableOpen} timeout="auto" unmountOnExit>
          <TransactionTable
            paginatedTransactions={data!}
            onPageChange={handlePageChange}
          />
          <CollapseButton
            className="mt-2 flex flex-row justify-center"
            onClick={() => setCategory(null)}
          />
        </Collapse>
      </Stack>
    </>
  );
}
