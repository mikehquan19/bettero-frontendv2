'use client';

import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { Account } from '@/interface';

type FinancialCardProps = {
  account: Account;
};

type CardTheme = {
  background: string;
  primary: string;
  secondary: string;
};

const institutionToTheme: Record<string, CardTheme> = {
  'Bank of America': {
    background: 'grey.400',
    primary: 'common.white',
    secondary: 'grey.200',
  },
  'JP Morgan Chase': {
    background: 'blue',
    primary: 'common.white',
    secondary: 'blue.200',
  },
};

export default function FinancialCard(props: FinancialCardProps) {
  const account = props.account;

  /** Show only the last 4 digits of the 16-digit account number */
  function hideAccNumber(accNumber: number): number {
    return accNumber % 10000;
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        minWidth: 340,
        minHeight: 220,
        bgcolor: institutionToTheme[account.institution].background,
        color: institutionToTheme[account.institution].primary,
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Stack
          sx={{
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h5">{account.institution}</Typography>
            <Typography>{account.acc_name}</Typography>
          </Box>
          <Box>
            {account.type == 'Credit' && (
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 14 }}>Next due:</Typography>
                  <Typography>
                    {account.next_due!.toISOString().split('T')[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14 }}>Limit:</Typography>
                  <Typography variant="h6">
                    ${account.credit_limit!.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <Typography sx={{ fontSize: 14 }}>
                **** **** **** {hideAccNumber(account.acc_number)}
              </Typography>
              <Box>
                <Typography sx={{ fontSize: 14 }}>Balance:</Typography>
                <Typography variant="h5">
                  ${account.balance.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
