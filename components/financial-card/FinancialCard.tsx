'use client';

import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import bankToTheme from './bankToTheme';
import { Account } from '@/interface';

export default function FinancialCard(props: { account: Account }) {
  const account = props.account;

  /** Show only the last 4 digits of the 16-digit account number */
  function hideAccNumber(accNumber: number): number {
    return accNumber % 10000;
  }

  function toString(d: Date | null): string {
    if (d !== null) {
      return new Date(d).toISOString().split('T')[0];
    }
    return '';
  }

  return (
    <Card
      className={`rounded-xl min-w-[340] min-h-[220] ${
        bankToTheme[account.institution].background
      } ${bankToTheme[account.institution].primary}`}
    >
      <CardContent className="h-full">
        <Stack className="h-full justify-between">
          <Box>
            <Typography variant="h5">{account.institution}</Typography>
            <Typography>{account.acc_name}</Typography>
          </Box>
          <Box>
            {account.type == 'Credit' && (
              <Stack direction="row" className="justify-between items-end">
                <Box>
                  <Typography className="text-sm">Next due:</Typography>
                  <Typography>{toString(account.next_due)}</Typography>
                </Box>
                <Box>
                  <Typography className="text-sm">Limit:</Typography>
                  <Typography variant="h6">
                    $
                    {account.credit_limit !== null
                      ? account.credit_limit.toFixed(2)
                      : -1}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
          <Box>
            <Stack direction="row" className="justify-between items-end">
              <Typography className="text-sm">
                **** **** **** {hideAccNumber(account.acc_number)}
              </Typography>
              <Box>
                <Typography className="text-sm">Balance:</Typography>
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
