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
  openBanner: (state: BannerState) => {},
});

export type BannerState = {
  message: string;
  severity: 'success' | 'error';
};

export function useBanner() {
  const context = useContext(BannerContext);
  return context.openBanner;
}

export default function BannerProvider(props: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [bannerState, setBannerState] = useState<BannerState>({
    message: '',
    severity: 'success',
  });

  function handleClose(
    event: SyntheticEvent | Event,
    reason: SnackbarCloseReason,
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  function handleOpenBanner(state: BannerState) {
    setBannerState(state);
    setOpen(true);
  }

  return (
    <BannerContext.Provider value={{ openBanner: handleOpenBanner }}>
      {props.children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={4000}
        key={'topcenter'}
        onClose={handleClose}
      >
        <Alert
          severity={bannerState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {bannerState.message}
        </Alert>
      </Snackbar>
    </BannerContext.Provider>
  );
}
