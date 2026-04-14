import ExpenseChange from '@/components/charts/ExpenseChange';
import ExpenseComposition from '@/components/charts/ExpenseComposition';
import FinancialCard from '@/components/financial-card/FinancialCard';
import CardWrapper from '@/components/financial-card/CardWrapper';
import TransactionTable from '@/components/tables/TransactionTable';
import { Stack, Typography } from '@mui/material';
import { fetchTransactions } from '@/lib/fetchTransactions';
import { fetchAccounts } from '@/lib/fetchAccounts';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const offset = Number(searchParams.offset ?? '0');
  const accountId = searchParams.accountId
    ? Number(searchParams.accountId)
    : undefined;

  const [accountsData, transactionsData] = await Promise.all([
    fetchAccounts(),
    fetchTransactions(offset, accountId),
  ]);
  if (transactionsData.error !== '' || accountsData.error !== '') {
    console.log(accountsData.error);
    return <div></div>;
  }

  const accounts = accountsData.data!;
  const paginatedTrans = transactionsData.data!;

  const creditAccounts = accounts.filter((account) => account.type == 'Credit');
  const debitAccounts = accounts.filter((account) => account.type == 'Debit');

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 1,
        }}
      >
        Spending analysis this month
      </Typography>
      <Stack
        direction="row"
        sx={{
          bgcolor: '#BFDBFE',
          borderRadius: 3,
          boxShadow: 1,
          justifyContent: 'space-evenly',
          p: 4,
        }}
      >
        <ExpenseChange percentages={null} />
        <ExpenseComposition percentages={null} />
      </Stack>
      <Stack sx={{ mt: 2, mb: 2 }} spacing={1}>
        <CardWrapper type="Debit" numAccounts={debitAccounts.length}>
          {debitAccounts.map((account) => (
            <FinancialCard key={account.id} account={account} />
          ))}
        </CardWrapper>

        <CardWrapper type="Credit" numAccounts={creditAccounts.length}>
          {creditAccounts.map((account) => (
            <FinancialCard key={account.id} account={account} />
          ))}
        </CardWrapper>
      </Stack>
      <TransactionTable paginatedTrans={paginatedTrans} />
    </>
  );
}
