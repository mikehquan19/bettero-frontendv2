import FinancialCard from '@components/financial-card/FinancialCard';
import CardWrapper from '@components/financial-card/CardWrapper';
import { Stack } from '@mui/material';
import { fetchTransactions } from '@lib/fetchTransactions';
import { fetchAccounts } from '@lib/fetchAccounts';
import PageError from './pageError';
import { fetchAnalysisInfo } from '@lib/fetchAnalysisInfo';
import Analysis from '@app/Analysis';
import TransactionContainer from '@components/transactions/TransactionContainer';
import { getTime } from '@lib/time';

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

  // To get analysis of this month
  const [firstDate, lastDate] = getTime();

  try {
    const [analysisData, accounts, paginatedTrans] = await Promise.all([
      fetchAnalysisInfo(firstDate, lastDate),
      fetchAccounts(),
      fetchTransactions(merchant, description, offset),
    ]);

    const credit = accounts.filter((acc) => acc.type === 'Credit');
    const debit = accounts.filter((acc) => acc.type === 'Debit');

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
  } catch (error) {
    return (
      <PageError
        errorMessage={
          error instanceof Error ? error.message : 'Unknown reasons'
        }
      />
    );
  }
}
