import { Typography } from '@mui/material';

export default function PageError(props: { errorMessage: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Typography variant="h5">ERROR: {props.errorMessage}</Typography>
    </div>
  );
}
