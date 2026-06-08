import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export default function AccountDelete(props: {
  open: boolean;
  id: number;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog
      data-cy="delete-account"
      open={props.open}
      onClose={props.onClose}
      slotProps={{
        paper: {
          className: 'bg-blue-200 p-4 rounded-xl shadow-lg',
        },
      }}
    >
      <DialogTitle className="font-bold">DELETE ACCOUNT</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this account: {props.id}?
      </DialogContent>
      <DialogActions className="mt-4 flex flex-row justify-center">
        <Button
          type="submit"
          variant="contained"
          className="bg-gray-400 font-bold rounded-lg"
          onClick={() => props.onSubmit()}
        >
          SURE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
