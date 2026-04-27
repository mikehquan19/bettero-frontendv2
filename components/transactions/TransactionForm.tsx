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
import { ChangeEvent, useEffect, useState } from 'react';
import { Account, categories } from '@/interface';
import dayjs from 'dayjs';

export type CreateTransactionBody = {
  account_id: string;
  merchant: string;
  tran_description: string;
  category: string;
  amount: number;
  created_at: string;
};

function defaultCreateTransactionBody() {
  return {
    account_id: '',
    merchant: '',
    tran_description: '',
    category: '',
    amount: 0,
    created_at: '',
  } as CreateTransactionBody;
}

export type UpdateTransactionBody = {
  merchant: string;
  tran_description: string;
  category: string;
  amount: number;
  created_at: string;
};

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

  useEffect(() => {
    // Reset the data
    if (props.open) {
      setFormData(props.currentData ?? defaultCreateTransactionBody());
    }
  }, [props.open, props.currentData]);

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
                  <MenuItem value={account.id}>{account.acc_name}</MenuItem>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, merchant: e.target.value });
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, tran_description: e.target.value });
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, amount: Number(e.target.value) });
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
          onClick={() => props.onSubmit(formData)}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
