'use client';

import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { BankToTheme } from '@constant';
import { Account } from '@interface';
import dayjs from 'dayjs';

export default function FinancialCard(props: {
  account: Account;
  forDetail?: boolean;
}) {
  const bank = props.account.institution;
  const bg = BankToTheme[bank].background;
  const text = BankToTheme[bank].primary;

  const nextDue = props.account.next_due
    ? dayjs(props.account.next_due).format('MMM D, YYYY')
    : '';

  const creditLimit = props.account.credit_limit
    ? props.account.credit_limit.toFixed(2)
    : -1;

  // Show only the last 4 digits of the account number
  const accNumber = props.forDetail
    ? props.account.acc_number
    : `**** **** **** ${props.account.acc_number % 10000}`;

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
                <Typography className="text-sm">Due:</Typography>
                <Typography>{nextDue}</Typography>
              </Box>
              <Box>
                <Typography className="text-sm">Limit:</Typography>
                <Typography>${creditLimit}</Typography>
              </Box>
            </Stack>
          )}
          <Stack direction="row" className="justify-between items-end">
            <Typography className={props.forDetail ? 'text-lg' : 'text-sm'}>
              {accNumber}
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
