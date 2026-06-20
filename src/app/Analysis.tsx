'use client';

import { Typography, Stack, Collapse, Button, Tooltip } from '@mui/material';
import ExpenseChange from '@components/charts/ExpenseChange';
import ExpenseComposition from '@components/charts/ExpenseComposition';
import TransactionTable from '@components/transactions/TransactionTable';
import {
  AnalysisInfo,
  BasicInfo,
  PaginatedData,
  Transaction,
} from '@interface';
import useSWR from 'swr';
import { useState, MouseEvent, useEffect } from 'react';
import { BASE_URL, PageLimit } from '@constant';
import { getThisMonthDates } from '@lib/time';
import ExpenseDaily from '@components/charts/ExpenseDaily';

/**
 * Button to close the collapse
 */
function CollapseButton(props: {
  className: string | undefined;
  onClick: () => void;
}) {
  return (
    <div className={props.className}>
      <Tooltip title="Collapse the table">
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

function InfoCards(props: { info: BasicInfo }) {
  /**
   * Normalize the snake case field to capitalized word
   */
  function normalize(field: string) {
    const str = field.replaceAll('_', ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {[
        'total_balance',
        'total_amount_due',
        'total_income',
        'total_expense',
      ].map((field) => (
        <div
          key={field}
          className="bg-blue-400 rounded-xl shadow-md flex flex-col justify-between h-24 p-3"
        >
          <Typography className="self-start text-lg">
            {normalize(field)}
          </Typography>
          <Typography variant="h5" className="self-end font-bold">
            {props.info[field as keyof BasicInfo]}
          </Typography>
        </div>
      ))}
    </div>
  );
}

type transactionFetchKey = {
  category: string | null;
  offset: number;
};

export default function Analysis(props: { analysisData: AnalysisInfo }) {
  const [fetchKey, setFetchKey] = useState<transactionFetchKey>({
    category: null,
    offset: 0,
  });
  const [tranTableTitle, setTranTableTitle] = useState('');
  // For communication between back to latest button and the chart
  const [deselectSignal, setDeselectSignal] = useState<'DESELECT' | undefined>(
    undefined,
  );

  const basicData = props.analysisData.basic;
  const dailyData = props.analysisData.daily;
  const changeData = props.analysisData.change;
  const compositionData = props.analysisData.composition;

  /**
   * Fetcher for client-fetching using useSWR
   */
  async function transactionFetcher(
    key: transactionFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    const [firstDate, lastDate] = getThisMonthDates();
    // Enforce that category is undefined
    let transactionUrl = `${BASE_URL}/transactions?`;
    transactionUrl += `category=${key.category!}&start=${firstDate}&end=${lastDate}&offset=${key.offset}`;

    const res = await fetch(transactionUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
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

  const tableOpen = fetchKey.category !== null && Boolean(data);

  useEffect(() => {
    if (!isValidating && Boolean(data)) {
      const display = (fetchKey.category ?? '').toLocaleLowerCase();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTranTableTitle(`List of ${display} transactions`);
    }
  }, [isValidating, data, fetchKey.category]);

  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    // If offset changes, useSWR should be able to re-fetch data because key changes
    setFetchKey((prev) => ({ ...prev, offset: newOffset }));
  }

  function handleDeselect() {
    if (fetchKey.category !== null) {
      setFetchKey((prevKey) => ({
        ...prevKey,
        category: null,
        offset: 0,
      }));
    }
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
      <Stack spacing={6} className="bg-blue-300 rounded-b-xl shadow-lg p-4">
        <InfoCards info={basicData} />
        <ExpenseDaily dailyExpenses={dailyData} />
        <Stack direction="row" className="justify-evenly">
          <ExpenseChange percentages={changeData} />
          <ExpenseComposition
            percentages={compositionData}
            deselectSignal={deselectSignal}
            onSelectCategory={(category) => {
              if (category !== fetchKey.category) {
                // Moves back to first page when changing category
                setFetchKey((prevKey) => ({ ...prevKey, category, offset: 0 }));
              }
            }}
            onDeselect={handleDeselect}
            onResetSignal={() => setDeselectSignal(undefined)}
          />
        </Stack>

        {/* Collapsible transaction table */}
        <Collapse className="mt-8" in={tableOpen} timeout="auto" unmountOnExit>
          <div data-cy="category-tran-table">
            <TransactionTable
              title={tranTableTitle}
              highlightBorder
              paginatedTransactions={data!}
              onPageChange={handlePageChange}
            />
          </div>
          <CollapseButton
            className="mt-2 flex flex-row justify-center"
            onClick={() => {
              handleDeselect();
              setDeselectSignal('DESELECT');
            }}
          />
        </Collapse>
      </Stack>
    </>
  );
}
