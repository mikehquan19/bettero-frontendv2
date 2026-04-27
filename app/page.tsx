import FinancialCard from '@/components/financial-card/FinancialCard';
import CardWrapper from '@/components/financial-card/CardWrapper';
import { Stack } from '@mui/material';
import { fetchTransactions } from '@/lib/fetchTransactions';
import { fetchAccounts } from '@/lib/fetchAccounts';
import PageError from './pageError';
import { fetchAnalysisInfo } from '@/lib/fetchAnalysisInfo';
import Analysis from '@/app/Analysis';
import TransactionContainer from '@/components/transactions/TransactionContainer';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const offset = Number(searchParams.offset ?? '0');

  // To get analysis of this month
  const date = new Date();
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  try {
    const [analysisData, accounts, paginatedTrans] = await Promise.all([
      fetchAnalysisInfo(firstDate, lastDate),
      fetchAccounts(),
      fetchTransactions(offset),
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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown reasons';
    return <PageError errorMessage={errorMessage} />;
  }
}
