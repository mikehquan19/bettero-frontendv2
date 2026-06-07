'use client';

import { BASE_URL, PageLimit } from '@constant';
import {
  Account,
  AccountAnalysisInfo,
  PaginatedData,
  Transaction,
} from '@interface';
import FinancialCard from '@components/financial-card/FinancialCard';
import { Button, Collapse, Stack, Tooltip } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AccountForm from '@components/financial-card/AccountForm';
import { getThisMonthDates } from '@lib/time';
import ExpenseChange from '@components/charts/ExpenseChange';
import ExpenseComposition from '@components/charts/ExpenseComposition';
import TransactionTable from '@components/transactions/TransactionTable';
import { useState, MouseEvent, useEffect } from 'react';
import useSWR from 'swr';

/**
 * Option button for the detailed financial card
 */
function OptionButton(props: {
  title: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip title={props.title}>
      <Button
        className="bg-gray-400 font-bold rounded-lg"
        variant="contained"
        onClick={props.onClick}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {props.icon ?? props.icon}
          <span>{props.label}</span>
        </Stack>
      </Button>
    </Tooltip>
  );
}

type accTranFetchKey = {
  accountId: number;
  category: string | null;
  offset: number;
};

export default function DetailedFinancialCard(props: { account: Account }) {
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  //const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [tranFetchKey, setTranFetchKey] = useState<accTranFetchKey>({
    accountId: props.account.id,
    category: null,
    offset: 0,
  });

  /**
   * Fetch the analysis for this account on demand, when the user clicks the "Details" button
   */
  async function analysisFetcher(
    accountId: number,
  ): Promise<AccountAnalysisInfo> {
    try {
      const [firstDate, lastDate] = getThisMonthDates();
      const url = `${BASE_URL}/accounts/${accountId}/summary?start=${firstDate}&end=${lastDate}`;
      const res = await fetch(url, { method: 'GET' });
      const resData = await res.json();
      if (resData.error !== '') {
        throw new Error(resData.error);
      }

      return {
        accountId: accountId,
        daily: resData.data.daily,
        change: resData.data.change,
        composition: resData.data.composition,
      } as AccountAnalysisInfo;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  const { data: analysisData } = useSWR(
    analysisOpen ? props.account.id.toString() : null,
    analysisFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // To keep previous data while closing the details
    },
  );

  const changeData = analysisData?.change;
  const compositionData = analysisData?.composition;

  /**
   * Fetch the transactions for this account on demand
   */
  async function transactionsFetcher(
    key: accTranFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    try {
      const [firstDate, lastDate] = getThisMonthDates();
      let url = `${BASE_URL}/accounts/${key.accountId}/transactions?`;
      url += `start=${firstDate}&end=${lastDate}&offset=${key.offset}`;
      if (key.category) {
        url += `&category=${key.category}`;
      }
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
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  // Fetch transactions data
  const { data: transactionsData } = useSWR(
    analysisOpen ? tranFetchKey : null,
    transactionsFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // To keep previous data while changing category or page
    },
  );

  // Reset category and pagination when closing the details
  useEffect(() => {
    if (!analysisOpen) {
      setTranFetchKey((prev) => ({ ...prev, category: null, offset: 0 }));
    }
  }, [analysisOpen]);

  // Open details only when analysis and transactions have been loaded initially
  // If details is already open, keepPreviousData will ensure the data is still there while changing category or page,
  // so we don't need to check for loading state after the initial load.
  const present =
    analysisOpen && Boolean(analysisData) && Boolean(transactionsData);

  /**
   * Convert account to CreateAccountBody for pre-filling the update form
   */
  function convertToCreateAccountBody(account: Account) {
    return {
      acc_number: account.acc_number.toString(),
      acc_name: account.acc_name,
      institution: account.institution,
      type: account.type,
      balance: account.balance.toString(),
      credit_limit: account.credit_limit
        ? account.credit_limit.toString()
        : null,
      next_due: account.next_due
        ? new Date(account.next_due).toISOString().split('T')[0]
        : null,
    };
  }

  /**
   * Handle page change for the transaction table pagination
   */
  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    setTranFetchKey((prev) => ({ ...prev, offset: newOffset }));
  }

  return (
    <div className="p-2 rounded-xl bg-blue-300">
      <FinancialCard account={props.account} forDetail />
      <Stack direction="row" spacing={2} className="justify-center mt-2">
        <OptionButton
          title="See this account's analysis and transactions"
          label="Details"
          onClick={() => {
            setAnalysisOpen(!analysisOpen);
          }}
        />
        <OptionButton
          title="Edit this account"
          label="Edit"
          icon={<ModeEditIcon />}
          onClick={() => {
            setUpdateFormOpen(true);
          }}
        />
        <OptionButton
          title="Delete this account"
          label="Delete"
          icon={<DeleteForeverIcon />}
          onClick={() => {}}
        />
      </Stack>

      <Collapse className="mt-8 p-4" in={present} timeout="auto" unmountOnExit>
        <Stack direction="row" className="justify-evenly mb-8">
          <ExpenseChange percentages={changeData!} />
          <ExpenseComposition
            percentages={compositionData!}
            onChangeCategory={(category) => {
              setTranFetchKey((prev) => ({ ...prev, category, offset: 0 }));
            }}
          />
        </Stack>
        <TransactionTable
          paginatedTransactions={transactionsData!}
          onPageChange={handlePageChange}
        />
        <Stack direction="row" className="justify-center mt-4">
          <OptionButton
            title="Go back to list of latest transactions"
            label="Back to latest"
            onClick={() => {
              setTranFetchKey((prev) => ({
                ...prev,
                category: null,
                offset: 0,
              }));
            }}
          />
        </Stack>
      </Collapse>
      <AccountForm
        type="UPDATE"
        open={updateFormOpen}
        currentData={convertToCreateAccountBody(props.account)}
        accountType={props.account.type}
        onClose={() => {
          setUpdateFormOpen(false);
        }}
        onSubmit={() => {}}
      />
    </div>
  );
}
