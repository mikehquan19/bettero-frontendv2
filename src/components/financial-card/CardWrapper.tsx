'use client';

import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountForm from './AccountForm';
import { CreateAccountBody } from '@interface';
import { BannerState, useBanner } from '@components/snackbar/BannerProvider';
import { createAccount } from '@lib/fetchAccounts';

export default function CardWrapper(props: {
  type: 'Debit' | 'Credit';
  numAccounts: number;
  children: ReactNode;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();
  const openBanner = useBanner();

  const type = props.type.toLocaleLowerCase();
  return (
    <>
      <Box className="rounded-xl shadow-lg bg-blue-300">
        <Stack
          direction="row"
          className="bg-gray-400 text-white rounded-t-xl justify-between items-center p-2"
        >
          <Typography variant="h6" className="font-bold">
            List of {type} accounts ({props.numAccounts}):
          </Typography>
          <Tooltip title="See details">
            <IconButton
              id="See details"
              onClick={() => router.push(`/accounts?type=${type}`)}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {props.numAccounts != 0 ? (
          <Stack
            direction="row"
            spacing={2}
            className="py-3 px-2 overflow-x-auto"
          >
            {props.children}
          </Stack>
        ) : (
          <Typography variant="h6" className="text-center font-bold p-2">
            There are no {type} accounts
          </Typography>
        )}
      </Box>
      <Stack direction="row" className="justify-center mt-1">
        <Tooltip title={`Add ${type} card`}>
          <IconButton
            data-cy="add-account-btn"
            onClick={() => setFormOpen(true)}
          >
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
      <AccountForm
        type="CREATE"
        open={formOpen}
        onClose={() => setFormOpen(false)}
        accountType={props.type}
        currentData={null}
        onSubmit={async (data: CreateAccountBody) => {
          let state: BannerState;
          try {
            const created = await createAccount(data);
            state = {
              message: `${created.acc_name} created successfully!`,
              severity: 'success',
            };
            setFormOpen(false); // Close the form
          } catch (error) {
            state = {
              message:
                error instanceof Error
                  ? error.message
                  : 'An unknown error occured',
              severity: 'error',
            };
          }
          // Open the banner showing the results of the actions
          openBanner(state);
        }}
      />
    </>
  );
}
