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
      <Box
        sx={{
          borderRadius: 3,
          boxShadow: 1,
          bgcolor: '#BFDBFE',
        }}
      >
        <Stack
          direction="row"
          sx={{
            bgcolor: 'grey.400',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
        {/* Main wrapper */}
        {numAccounts != 0 ? (
          <Stack direction="row" spacing={1} sx={{ p: 1, overflowX: 'auto' }}>
            {children}
          </Stack>
        ) : (
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              p: 1,
              fontWeight: 'bold',
            }}
          >
            There are not {type.toLowerCase()} accounts
          </Typography>
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'center',
          mt: 1,
        }}
      >
        <Tooltip title={`Add ${type.toLowerCase()} card`}>
          <IconButton>
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}
