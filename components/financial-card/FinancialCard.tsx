'use client';

import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { Account } from '@/interface';

type FinancialCardProps = {
  account: Account;
};

type CardTheme = {
  background: string;
  primary: string;
};

const bankToTheme: Record<string, CardTheme> = {
  'Bank of America': {
    background: 'grey.400',
    primary: 'common.white',
  },
  'JP Morgan Chase': {
    background: '#1A237E',
    primary: 'common.white',
  },
  'Wells Fargo': {
    background: '#D71E28',
    primary: 'common.white',
  },
  'Citi Bank': {
    background: '#003B70',
    primary: 'common.white',
  },
  'Capital One': {
    background: '#004879',
    primary: 'common.white',
  },
  Discover: {
    background: '#E55C20',
    primary: 'common.white',
  },
  'Sofi Bank': {
    background: '#00A3E0',
    primary: 'common.white',
  },
  'Ally Bank': {
    background: '#5F259F',
    primary: 'common.white',
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
        bgcolor: bankToTheme[account.institution].background,
        color: bankToTheme[account.institution].primary,
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
                    {new Date(account.next_due!).toISOString().split('T')[0]}
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
