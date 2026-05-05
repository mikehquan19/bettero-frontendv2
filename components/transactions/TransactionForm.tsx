'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Account,
  CreateTransactionBody,
  defaultCreateTransactionBody,
  defaultTransactionFormError,
  TransactionFormError,
} from '@/interface';
import { categories } from '@/constant';
import { BannerState, useBanner } from '../snackbar/BannerProvider';
import {
  SelectOption,
  SelectField,
  ValidatedTextField,
  ValidatedNumberField,
  DateTimeField,
} from '../financial-card/AccountForm';

type TransactionFormProps = {
  type: 'CREATE' | 'UPDATE';
  open: boolean;
  currentData: CreateTransactionBody | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateTransactionBody) => void;
};

export default function TransactionForm(props: TransactionFormProps) {
  const [data, setData] = useState(defaultCreateTransactionBody());
  const [error, setError] = useState(defaultTransactionFormError());
  const openBanner = useBanner();

  const accountOptions = props.accounts.map(
    (a) =>
      ({
        label: a.institution + "'s " + a.acc_name,
        value: String(a.id),
      }) as SelectOption,
  );

  useEffect(() => {
    // Reset the data and the error of the form
    if (props.open) {
      setData(props.currentData ?? defaultCreateTransactionBody());
      setError(defaultTransactionFormError());
    }
  }, [props.open, props.currentData]);

  function handleSubmit() {
    let canSubmit = true;
    Object.keys(data).forEach((key) => {
      if (
        data[key as keyof CreateTransactionBody] === '' ||
        error[key as keyof TransactionFormError] !== ''
      ) {
        canSubmit = false;
        return;
      }
    });
    if (canSubmit) {
      props.onSubmit(data);
    } else {
      openBanner({
        message: "Can't submit the form due to field-level error",
        severity: 'error',
      } as BannerState);
    }
  }

  function setField(field: string, value: string, _error: string) {
    setData({ ...data, [field]: value });
    setError({ ...error, [field]: _error });
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
          <SelectField
            label="Account"
            options={accountOptions}
            value={data.account_id}
            error={error.account_id}
            onChange={(value, error) => setField('account_id', value, error)}
          />
        )}
        <ValidatedTextField
          label="Merchant"
          value={data.merchant}
          error={error.merchant}
          onChange={(value, error) => setField('merchant', value, error)}
        />
        <ValidatedTextField
          label="Description"
          value={data.tran_description}
          error={error.tran_description}
          onChange={(value, error) =>
            setField('tran_description', value, error)
          }
        />
        <SelectField
          label="Category"
          options={categories}
          value={data.category}
          error={error.category}
          onChange={(value, error) => setField('category', value, error)}
        />
        <ValidatedNumberField
          label="Amount"
          value={data.amount}
          error={error.amount}
          onChange={(value, error) => setField('amount', value, error)}
        />
        <DateTimeField
          label="Created date"
          value={data.created_at}
          onChange={(value) => setField('created_at', value, '')}
        />
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
