'use client';
import ExpenseChange from '@/components/charts/ExpenseChange';
import ExpenseComposition from '@/components/charts/ExpenseComposition';
import FinancialCard from '@/components/financial-card/FinancialCard';
import CardWrapper from '@/components/financial-card/CardWrapper';
import TransactionTable from '@/components/tables/TransactionTable';
import { sampleAccounts } from '@/data/accounts';
import { useState, useEffect } from 'react';
import { Stack, Typography } from '@mui/material';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const creditAccounts = sampleAccounts.filter((account) => account.type == 'Credit');
  const debitAccounts = sampleAccounts.filter((account) => account.type == 'Debit');

  if (!isClient) return <></>;
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
          boxShadow: 3,
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
      <TransactionTable />
    </>
  );
}
