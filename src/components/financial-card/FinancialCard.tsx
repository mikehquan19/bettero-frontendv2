'use client';

import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { BankToTheme } from '@constant';
import { Account } from '@interface';

export default function FinancialCard(props: {
  account: Account;
  forDetail?: boolean;
}) {
  /**
   * Show only the last 4 digits of the 16-digit account number
   */
  function hideAccNumber(accNumber: number): number {
    return accNumber % 10000;
  }

  function toString(d: Date | null): string {
    if (d !== null) {
      return new Date(d).toISOString().split('T')[0];
    }
    return '';
  }

  const bank = props.account.institution;
  const bg = BankToTheme[bank].background;
  const text = BankToTheme[bank].primary;

  return (
    <Card
      data-cy={`${props.account.type.toLowerCase()}-card`}
      className={`rounded-xl min-w-[360px] h-[240px] ${bg} ${text}`}
    >
      <CardContent className="h-full">
        <Stack className="h-full justify-between">
          <Box>
            <Typography variant="h5">{bank}</Typography>
            <Typography>{props.account.acc_name}</Typography>
          </Box>
          {props.account.type == 'Credit' && (
            <Stack direction="row" className="justify-between">
              <Box>
                <Typography className="text-sm">Next due:</Typography>
                <Typography>{toString(props.account.next_due)}</Typography>
              </Box>
              <Box>
                <Typography className="text-sm">Limit:</Typography>
                <Typography>
                  $
                  {props.account.credit_limit !== null
                    ? props.account.credit_limit.toFixed(2)
                    : -1}
                </Typography>
              </Box>
            </Stack>
          )}
          <Stack direction="row" className="justify-between items-end">
            <Typography className={props.forDetail ? 'text-lg' : 'text-sm'}>
              {props.forDetail
                ? props.account.acc_number
                : `**** **** **** ${hideAccNumber(props.account.acc_number)}`}
            </Typography>
            <Box>
              <Typography className="text-sm">Balance:</Typography>
              <Typography variant="h5">
                ${props.account.balance.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
