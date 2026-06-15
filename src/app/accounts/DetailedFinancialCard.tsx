'use client';

import { BASE_URL, PageLimit } from '@constant';
import {
  Account,
  AccountAnalysisInfo,
  CreateAccountBody,
  PaginatedData,
  Transaction,
  UpdateAccountBody,
} from '@interface';
import { Button, Collapse, Stack, Tooltip } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FinancialCard from '@components/financial-card/FinancialCard';
import AccountForm from '@components/financial-card/AccountForm';
import { getThisMonthDates } from '@lib/time';
import { deleteAccount, updateAccount } from '@lib/fetchAccounts';
import ExpenseChange from '@components/charts/ExpenseChange';
import ExpenseComposition from '@components/charts/ExpenseComposition';
import ExpenseDaily from '@components/charts/ExpenseDaily';
import TransactionTable from '@components/transactions/TransactionTable';
import { useState, MouseEvent } from 'react';
import { useBanner } from '@components/snackbar/BannerProvider';
import useSWR from 'swr';
import AccountDelete from '@components/financial-card/AccountDelete';

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

type AccTranFetchKey = {
  accountId: number;
  category: string | null;
  offset: number;
};

/**
 * Financial Card that enables user to see the datailed analysis of the account, as well as
 * take actions on the account.
 */
export default function DetailedFinancialCard(props: { account: Account }) {
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [tranFetchKey, setTranFetchKey] = useState<AccTranFetchKey>({
    accountId: props.account.id,
    category: null,
    offset: 0,
  });
  const openBanner = useBanner();

  /**
   * Fetch the analysis for this account on demand, when the user clicks the "Details" button
   */
  async function analysisFetcher(
    accountId: number,
  ): Promise<AccountAnalysisInfo> {
    const [firstDate, lastDate] = getThisMonthDates();
    const accSummaryUrl = `${BASE_URL}/accounts/${accountId}/summary?start=${firstDate}&end=${lastDate}`;
    const res = await fetch(accSummaryUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }

    return {
      accountId: accountId,
      daily: resData.data.daily ?? {},
      change: resData.data.change ?? {},
      composition: resData.data.composition ?? {},
    } as AccountAnalysisInfo;
  }

  const { data: analysisData } = useSWR(
    analysisOpen ? props.account.id.toString() : null,
    analysisFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // To keep previous data while closing the details
    },
  );

  const dailyData = analysisData?.daily;
  const changeData = analysisData?.change;
  const compositionData = analysisData?.composition;

  /**
   * Fetch the transactions for this account on demand
   */
  async function transactionsFetcher(
    key: AccTranFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    const [firstDate, lastDate] = getThisMonthDates();

    let accTranUrl = `${BASE_URL}/accounts/${key.accountId}/transactions?`;
    accTranUrl += `start=${firstDate}&end=${lastDate}&offset=${key.offset}`;
    if (key.category) {
      accTranUrl += `&category=${key.category}`;
    }
    const res = await fetch(accTranUrl, {
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

  // Fetch transactions data
  const { data: transactionsData } = useSWR(
    analysisOpen ? tranFetchKey : null,
    transactionsFetcher,
    {
      revalidateOnFocus: false, // To avoid revalidating data when going back to the component
      keepPreviousData: true, // To keep previous data while changing category or page
    },
  );

  // Open details only when analysis and transactions have been loaded initially
  // If details is already open, keepPreviousData will ensure the data is still there while changing category or page,
  // so we don't need to check for loading state after the initial load.
  const present =
    analysisOpen && Boolean(analysisData) && Boolean(transactionsData);

  /**
   * Convert account to CreateAccountBody for pre-filling the update form
   */
  function convertToCreateAccountBody(account: Account): CreateAccountBody {
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
    } as CreateAccountBody;
  }

  function toggleAnalysisPanel() {
    setAnalysisOpen(!analysisOpen);
    // Reset category and pagination when closing the details
    if (!analysisOpen) {
      setTranFetchKey((prev) => ({ ...prev, category: null, offset: 0 }));
    }
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

  async function handleSubmitUpdateForm(data: CreateAccountBody) {
    // Convert to update body
    const updateData = {
      acc_number: Number(data.acc_number),
      acc_name: data.acc_name,
      institution: data.institution,
      balance: Number(data.balance),
      credit_limit: data.credit_limit ? Number(data.credit_limit) : null,
      next_due: data.next_due,
    } as UpdateAccountBody;

    try {
      const updated = await updateAccount(props.account.id, updateData);
      openBanner({
        message: `${updated.acc_name} updated successfully!`,
        severity: 'success',
      });
      setUpdateFormOpen(false);
    } catch (error) {
      openBanner({
        message: error instanceof Error ? error.message : 'Unknown reasons',
        severity: 'error',
      });
    }
  }

  async function handleSubmitDeleteModal() {
    try {
      const message = await deleteAccount(props.account.id);
      openBanner({
        message,
        severity: 'success',
      });
      setDeleteModalOpen(false);
    } catch (error) {
      openBanner({
        message: error instanceof Error ? error.message : 'Unknown reasons',
        severity: 'error',
      });
    }
  }

  return (
    <div className="p-2 rounded-xl bg-blue-300">
      <FinancialCard account={props.account} forDetail />
      <Stack direction="row" spacing={2} className="justify-center mt-2">
        <OptionButton
          title={
            analysisOpen
              ? 'Collapse this account analysis and transactions'
              : 'Expand this account analysis and transactions'
          }
          label="Details"
          icon={<SignalCellularAltIcon />}
          onClick={toggleAnalysisPanel}
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
          onClick={() => {
            setDeleteModalOpen(true);
          }}
        />
      </Stack>
      {/* Details panel */}
      <Collapse className="mt-8 p-4" in={present} timeout="auto" unmountOnExit>
        <ExpenseDaily dailyExpenses={dailyData!} />
        <Stack direction="row" className="justify-evenly my-8">
          <ExpenseChange percentages={changeData!} />
          <ExpenseComposition
            percentages={compositionData!}
            onChangeCategory={(category) => {
              if (category !== tranFetchKey.category) {
                // Move to first page when changing category
                setTranFetchKey((prev) => ({ ...prev, category, offset: 0 }));
              }
            }}
          />
        </Stack>
        <TransactionTable
          title={
            tranFetchKey.category
              ? `List of ${props.account.acc_name}'s ${tranFetchKey.category.toLocaleLowerCase()} transactions`
              : `List of ${props.account.acc_name}'s transactions`
          }
          highlightBorder
          paginatedTransactions={transactionsData!}
          onPageChange={handlePageChange}
        />
        <Stack direction="row" className="justify-center mt-4">
          <OptionButton
            title="Go back to list of latest transactions"
            label="Back to latest"
            onClick={() => {
              if (tranFetchKey.category !== null) {
                // Move to first page when going back to latest
                setTranFetchKey((prev) => ({
                  ...prev,
                  category: null,
                  offset: 0,
                }));
              }
            }}
          />
        </Stack>
      </Collapse>
      {/** Form for actions on individual account */}
      <AccountForm
        type="UPDATE"
        open={updateFormOpen}
        currentData={convertToCreateAccountBody(props.account)}
        accountType={props.account.type}
        onClose={() => {
          setUpdateFormOpen(false);
        }}
        onSubmit={handleSubmitUpdateForm}
      />
      <AccountDelete
        open={deleteModalOpen}
        id={props.account.id}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        onSubmit={handleSubmitDeleteModal}
      />
    </div>
  );
}
