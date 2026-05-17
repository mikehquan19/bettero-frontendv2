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
} from '@/src/interface';
import { categories } from '@/src/constant';
import { BannerState, useBanner } from '../snackbar/BannerProvider';
import {
  SelectOption,
  SelectField,
  ValidatedTextField,
  ValidatedNumberField,
  DateTimeField,
  SubmitButton,
} from '../financial-card/AccountForm';

type TransactionFormProps = {
  type: 'CREATE' | 'UPDATE';
  open: boolean;
  currentData: CreateTransactionBody | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateTransactionBody) => void;
};

/**
 * Form to create or update transaction.
 * Uses the custom built form fields created in AccountForm.tsx
 */
export default function TransactionForm(props: TransactionFormProps) {
  const [data, setData] = useState(
    props.currentData ?? defaultCreateTransactionBody(),
  );
  const [error, setError] = useState(defaultTransactionFormError());
  const openBanner = useBanner();

  // Convert the list of accounts to select options for custom select field
  const accountOptions = props.accounts.map(
    (a) =>
      ({
        label: a.institution + "'s " + a.acc_name,
        value: String(a.id),
      }) as SelectOption,
  );

  // Reset the data and the error of the form when opening or closing the form
  useEffect(() => {
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
    if (!(field in data && field in error)) {
      // Internal error,
      // developer recheck the field naming when this happens
      throw new Error('Invalid field, not in data or error: ' + field);
    }
    setData({ ...data, [field]: value });
    setError({ ...error, [field]: _error });
  }

  return (
    <Dialog
      data-cy="transaction-form"
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
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              dataCy="account-field"
              label="Account"
              options={accountOptions}
              value={data.account_id}
              error={error.account_id}
              onChange={(value, error) => setField('account_id', value, error)}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedTextField
            dataCy="merchant-field"
            label="Merchant"
            value={data.merchant}
            error={error.merchant}
            onChange={(value, error) => setField('merchant', value, error)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedTextField
            dataCy="description-field"
            label="Description"
            value={data.tran_description}
            error={error.tran_description}
            onChange={(value, error) =>
              setField('tran_description', value, error)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            dataCy="category-field"
            label="Category"
            options={categories}
            value={data.category}
            error={error.category}
            onChange={(value, error) => setField('category', value, error)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedNumberField
            dataCy="amount-field"
            label="Amount"
            value={data.amount}
            error={error.amount}
            onChange={(value, error) => setField('amount', value, error)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DateTimeField
            dataCy="created-date-field"
            label="Created date"
            value={data.created_at}
            onChange={(value) => setField('created_at', value, '')}
          />
        </Grid>
      </Grid>
      <DialogActions className="mt-4 flex flex-row justify-center">
        <SubmitButton onSubmit={handleSubmit} />
      </DialogActions>
    </Dialog>
  );
}
