import ExpenseChange from '@/components/charts/ExpenseChange';
import ExpenseComposition from '@/components/charts/ExpenseComposition';
import FinancialCard from '@/components/financial-card/FinancialCard';
import CardWrapper from '@/components/financial-card/CardWrapper';
import TransactionTable from '@/components/tables/TransactionTable';
import { Stack, Typography } from '@mui/material';
import { fetchTransactions } from '@/lib/fetchTransactions';
import { fetchAccounts } from '@/lib/fetchAccounts';
import PageError from './pageError';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const offset = Number(searchParams.offset ?? '0');
  const accountId = searchParams.accountId
    ? Number(searchParams.accountId)
    : -1;

  const [accountsData, transactionsData] = await Promise.all([
    fetchAccounts(),
    fetchTransactions(offset, accountId),
  ]);
  if (transactionsData.error !== '' || accountsData.error !== '') {
    return <PageError />;
  }

  const accounts = accountsData.data!;
  const paginatedTrans = transactionsData.data!;

  const creditAccs = accounts.filter((account) => account.type == 'Credit');
  const debitAccs = accounts.filter((account) => account.type == 'Debit');

  return (
    <>
      <Typography variant="h5" className="font-bold mb-1">
        Spending analysis this month
      </Typography>
      <Stack
        direction="row"
        className="bg-blue-200 rounded-xl shadow-lg p-4 justify-evenly"
      >
        <ExpenseChange percentages={null} />
        <ExpenseComposition percentages={null} />
      </Stack>
      <Stack className="my-4" spacing={1}>
        <CardWrapper type="Debit" numAccounts={debitAccs.length}>
          {debitAccs.map((acc) => (
            <FinancialCard key={acc.id} account={acc} />
          ))}
        </CardWrapper>
        <CardWrapper type="Credit" numAccounts={creditAccs.length}>
          {creditAccs.map((acc) => (
            <FinancialCard key={acc.id} account={acc} />
          ))}
        </CardWrapper>
      </Stack>
      <TransactionTable paginatedTrans={paginatedTrans} />
    </>
  );
}
