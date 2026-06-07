import PageError from '@app/pageError';
import { Account } from '@interface';
import { fetchAccounts } from '@lib/fetchAccounts';
import DetailedFinancialCard from './DetailedFinancialCard';
import { Stack, Typography } from '@mui/material';

export default async function Accounts(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const type = params.type
    ? typeof params.type === 'string'
      ? params.type
      : params.type[0]
    : undefined;

  let accounts: Account[];
  try {
    [accounts] = await Promise.all([fetchAccounts()]);
  } catch (error) {
    return (
      <PageError
        errorMessage={
          error instanceof Error ? error.message : 'Unknown reasons'
        }
      />
    );
  }
  if (type) {
    accounts = accounts.filter(
      (account) => account.type.toLocaleLowerCase() == type,
    );
  }

  return (
    <>
      <Typography variant="h5" className="font-bold text-gray-500">
        Account-specific analysis
      </Typography>
      <Stack spacing={3} className="mt-4">
        {accounts.map((account) => (
          <DetailedFinancialCard key={account.id} account={account} />
        ))}
      </Stack>
    </>
  );
}
