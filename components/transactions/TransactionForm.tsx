'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Account,
  CreateTransactionBody,
  defaultCreateTransactionBody,
  defaultTransactionFormError,
  TransactionFormError,
} from '@/interface';
import { categories } from '@/constant';
import dayjs from 'dayjs';
import { BannerState, useBanner } from '../snackbar/BannerProvider';

type TransactionFormProps = {
  type: 'CREATE' | 'UPDATE';
  open: boolean;
  currentData: CreateTransactionBody | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateTransactionBody) => void;
};

export default function TransactionForm(props: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionBody>(
    defaultCreateTransactionBody(),
  );
  const formErrorRef = useRef<TransactionFormError>(
    defaultTransactionFormError(),
  );
  const openBanner = useBanner();
  const formError = formErrorRef.current;

  useEffect(() => {
    // Reset the data and the error of the form
    if (props.open) {
      setFormData(props.currentData ?? defaultCreateTransactionBody());
      formErrorRef.current = defaultTransactionFormError();
    }
  }, [props.open, props.currentData]);

  function handleSubmit() {
    let canSubmit = true;
    Object.keys(formData).forEach((key) => {
      if (
        formData[key as keyof CreateTransactionBody] === '' ||
        formError[key as keyof TransactionFormError] !== ''
      ) {
        canSubmit = false;
        return;
      }
    });
    if (canSubmit) {
      props.onSubmit(formData);
    } else {
      openBanner({
        message: "Can't submit the form due to field-level error",
        severity: 'error',
      } as BannerState);
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      slotProps={{
        paper: {
          className: 'bg-blue-200 p-4 rounded-xl shadow-lg',
        },
      }}
    >
      <DialogTitle variant="h5" className="font-bold text-center mb-2">
        {props.type} TRANSACTIONS
      </DialogTitle>
      <Grid container spacing={2}>
        {props.type === 'CREATE' && (
          <Grid size={6}>
            <FormControl fullWidth required>
              <InputLabel id="account-select">Account</InputLabel>
              <Select
                labelId="account-select"
                label="Account"
                value={formData.account_id}
                onChange={(e: SelectChangeEvent) => {
                  setFormData({ ...formData, account_id: e.target.value });
                }}
              >
                {props.accounts.map((account) => (
                  <MenuItem value={account.id}>
                    {account.institution} {account.acc_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid size={6}>
          <TextField
            fullWidth
            required
            label="Merchant"
            name="Merchant"
            value={formData.merchant}
            error={formError.merchant.length > 0}
            helperText={formError.merchant}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              formError.merchant =
                e.target.value.trim().length == 0 ? 'Required' : '';
              setFormData({ ...formData, merchant: e.target.value.trim() });
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            required
            label="Description"
            name="Description"
            value={formData.tran_description}
            error={formError.tran_description.length > 0}
            helperText={formError.tran_description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              formError.tran_description =
                e.target.value.trim().length == 0 ? 'Required' : '';
              setFormData({
                ...formData,
                tran_description: e.target.value.trim(),
              });
            }}
          />
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth required>
            <InputLabel id="category-select">Category</InputLabel>
            <Select
              labelId="category-select"
              label="Category"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
              }}
            >
              {categories.map((category) => (
                <MenuItem value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            required
            label="Amount"
            name="Amount"
            value={formData.amount}
            error={formError.amount.length > 0}
            helperText={formError.amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.value.trim() === '') {
                formError.amount = 'Required';
              } else if (Number.isNaN(Number(e.target.value.trim()))) {
                formError.amount = 'Value must be numeric';
              } else if (Number(e.target.value.trim()) <= 0) {
                formError.amount = 'Value must be positive';
              } else {
                formError.amount = '';
              }
              setFormData({
                ...formData,
                amount: e.target.value.trim(),
              });
            }}
          />
        </Grid>
        <Grid size={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { fullWidth: true } }}
              label="Created date"
              value={
                formData.created_at !== '' ? dayjs(formData.created_at) : null
              }
              onChange={(e: PickerValue) => {
                if (e) {
                  setFormData({ ...formData, created_at: e.toISOString() });
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <DialogActions className="mt-4 flex flex-row justify-center">
        <Button
          type="submit"
          variant="contained"
          className="bg-gray-400 font-bold rounded-lg"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
