import ExpenseChange from '@/components/charts/ExpenseChange';
import ExpenseComposition from '@/components/charts/ExpenseComposition';
import FinancialCard from '@/components/financial-card/FinancialCard';
import CardWrapper from '@/components/financial-card/CardWrapper';
import TransactionTable from '@/components/tables/TransactionTable';
import { sampleAccounts } from '@/data/accounts';
import { Stack, Typography } from '@mui/material';
import { fetchTransactions } from '@/lib/fetchTransactions';

export default async function Home() {
  const creditAccounts = sampleAccounts.filter(
    (account) => account.type == 'Credit',
  );
  const debitAccounts = sampleAccounts.filter(
    (account) => account.type == 'Debit',
  );
  const tranData = await fetchTransactions(0, null);
  if (tranData.error !== '') {
    return <></>;
  }
  const transactions = tranData.data!;

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
      <Stack
        sx={{
          mt: 2,
          mb: 2,
        }}
      >
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
      <TransactionTable transactions={transactions} />
    </>
  );
}
