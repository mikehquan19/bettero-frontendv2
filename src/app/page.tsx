import FinancialCard from '@components/financial-card/FinancialCard';
import CardWrapper from '@components/financial-card/CardWrapper';
import { Stack } from '@mui/material';
import { fetchTransactions } from '@lib/fetchTransactions';
import { fetchAccounts } from '@lib/fetchAccounts';
import PageError from './pageError';
import { fetchAnalysisInfo } from '@lib/fetchAnalysisInfo';
import Analysis from '@app/Analysis';
import TransactionContainer from '@components/transactions/TransactionContainer';
import { getLastMonthDates, getThisMonthDates } from '@lib/time';
import { Account, AnalysisInfo, PaginatedData, Transaction } from '@interface';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const merchant = params.merchant
    ? typeof params.merchant === 'string'
      ? params.merchant
      : params.merchant[0]
    : undefined;
  const description = params.description
    ? typeof params.description === 'string'
      ? params.description
      : params.description[0]
    : undefined;
  const offset = Number(params.offset ?? '0');

  const [currStart, currEnd] = getThisMonthDates();
  const [prevStart, prevEnd] = getLastMonthDates();
  let analysisData: AnalysisInfo;
  let accounts: Account[];
  let paginatedTrans: PaginatedData<Transaction[]>;
  try {
    [analysisData, accounts, paginatedTrans] = await Promise.all([
      fetchAnalysisInfo(currStart, currEnd, prevStart, prevEnd),
      fetchAccounts(),
      fetchTransactions(merchant, description, offset),
    ]);
  } catch (error) {
    return (
      <PageError
        errorMessage={
          error instanceof Error ? error.message : 'Unknown reasons'
        }
      />
    );
  }

  const credit = accounts.filter((account) => account.type === 'Credit');
  const debit = accounts.filter((account) => account.type === 'Debit');

  return (
    <>
      <Analysis analysisData={analysisData} />

      <Stack className="my-4" spacing={1}>
        <CardWrapper type="Debit" numAccounts={debit.length}>
          {debit.map((acc) => (
            <FinancialCard key={acc.id} account={acc} />
          ))}
        </CardWrapper>
        <CardWrapper type="Credit" numAccounts={credit.length}>
          {credit.map((acc) => (
            <FinancialCard key={acc.id} account={acc} />
          ))}
        </CardWrapper>
      </Stack>

      <TransactionContainer
        accounts={accounts}
        paginatedTransactions={paginatedTrans}
      />
    </>
  );
}
