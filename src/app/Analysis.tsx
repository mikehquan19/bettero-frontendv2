'use client';

import { Typography, Stack, Collapse, Button, Tooltip } from '@mui/material';
import ExpenseChange from '@components/charts/ExpenseChange';
import ExpenseComposition from '@components/charts/ExpenseComposition';
import TransactionTable from '@components/transactions/TransactionTable';
import { AnalysisInfo, PaginatedData, Transaction } from '@interface';
import useSWR from 'swr';
import { useState, useEffect, MouseEvent } from 'react';
import { BASE_URL, PageLimit } from '@constant';
import { getThisMonthDates } from '@lib/time';

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
          data-cy="collapse-category-tran-btn"
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
  category: string | null;
  offset: number;
};

export default function Analysis(props: { analysisData: AnalysisInfo }) {
  const [tableOpen, setTableOpen] = useState<boolean>(false);
  const [fetchKey, setFetchKey] = useState<transactionFetchKey>({
    category: null,
    offset: 0,
  });

  const changeData = props.analysisData.change;
  const compositionData = props.analysisData.composition;

  /**
   * Fetcher for client-fetching using useSWR
   */
  async function transactionFetcher(
    key: transactionFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    try {
      const [firstDate, lastDate] = getThisMonthDates();
      // Enforce that category is undefined
      let url = `${BASE_URL}/transactions?`;
      url += `category=${key.category!}&start=${firstDate}&end=${lastDate}&offset=${key.offset}`;

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
    fetchKey.category ? fetchKey : null,
    transactionFetcher,
    {
      revalidateOnFocus: false, // Disable revalidation on window focus
      keepPreviousData: true, // To keep previous data while loading new one
    },
  );

  useEffect(() => {
    // If it's not open, open if initial data has been loaded.
    // Otherwise, close if button is clicked.
    if (!tableOpen) {
      setTableOpen(fetchKey.category !== null && !isValidating);
    } else if (fetchKey.category == null) {
      setTableOpen(false);
    }
  }, [fetchKey, isValidating, tableOpen]);

  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    // If offset changes, useSWR should be able to re-fetch data because key changes
    setFetchKey((prev) => ({ ...prev, offset: newOffset }));
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
            onChangeCategory={(category) => {
              // Moves back to first page when changing category
              setFetchKey((prev) => ({ ...prev, category, offset: 0 }));
            }}
          />
        </Stack>

        {/* Collapsible transaction table */}
        <Collapse className="mt-8" in={tableOpen} timeout="auto" unmountOnExit>
          <div data-cy="category-tran-table">
            <TransactionTable
              paginatedTransactions={data!}
              onPageChange={handlePageChange}
            />
          </div>
          <CollapseButton
            className="mt-2 flex flex-row justify-center"
            onClick={() => {
              setFetchKey((prev) => ({ ...prev, category: null, offset: 0 }));
            }}
          />
        </Collapse>
      </Stack>
    </>
  );
}
