'use client';

import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';
import {
  createContext,
  ReactNode,
  SyntheticEvent,
  useContext,
  useState,
} from 'react';

const BannerContext = createContext({
  openBanner: (message: string) => {},
});

export function useBanner() {
  const context = useContext(BannerContext);
  return context.openBanner;
}

export default function BannerProvider(props: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  function handleClose(
    event: SyntheticEvent | Event,
    reason: SnackbarCloseReason,
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  function handleOpenBanner(message: string) {
    setMessage(message);
    setOpen(true);
  }

  return (
    <BannerContext.Provider value={{ openBanner: handleOpenBanner }}>
      {props.children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={5000}
        key={'topcenter'}
        onClose={handleClose}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </BannerContext.Provider>
  );
}
