'use client';

import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type CardWrapperProps = {
  type: string;
  numAccounts: number;
  children: ReactNode;
};

export default function CardWrapper(props: CardWrapperProps) {
  const { type, numAccounts, children } = props;
  const router = useRouter();

  return (
    <>
      <Box className="rounded-xl shadow-lg bg-blue-200">
        <Stack
          direction="row"
          className="bg-gray-400 text-white rounded-t-xl justify-between items-center p-2"
        >
          <Typography variant="h6" className="font-bold">
            List of {type.toLowerCase()} accounts ({numAccounts}):
          </Typography>
          <Tooltip title="See details">
            <IconButton
              id="See details"
              onClick={() => router.push('/accounts')}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {numAccounts != 0 ? (
          <Stack
            direction="row"
            spacing={2}
            className="py-3 px-2 overflow-x-auto"
          >
            {children}
          </Stack>
        ) : (
          <Typography variant="h6" className="text-center font-bold p-2">
            There are not {type.toLowerCase()} accounts
          </Typography>
        )}
      </Box>
      <Stack direction="row" className="justify-center mt-1">
        <Tooltip title={`Add ${type.toLowerCase()} card`}>
          <IconButton>
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}
