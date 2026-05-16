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
  Typography,
} from '@mui/material';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  CreateAccountBody,
  CreateAccountError,
  defaultCreateAccountBody,
  defaultCreateAccountError,
} from '@/interface';
import { Institutions } from '@/constant';
import dayjs from 'dayjs';
import { BannerState, useBanner } from '../snackbar/BannerProvider';

type FieldProps = {
  label: string;
  value: string;
  error: string;
  onChange: (value: string, error: string) => void;
};

/**
 * TextField that enforces the validation for numerical input.
 * The value the parent component gets is string, but convertible to number
 */
export function ValidatedNumberField(props: FieldProps) {
  function handleChangeField(e: ChangeEvent<HTMLInputElement>) {
    // Validate the positive numeric value
    let _error = '';
    if (e.target.value.trim() === '') {
      _error = `${props.label} is required`;
    } else {
      const value = Number(e.target.value.trim());
      if (Number.isNaN(value)) {
        _error = `${props.label} must be numerical value`;
      } else if (value <= 0) {
        _error = `${props.label} must be positive value`;
      }
    }
    props.onChange(e.target.value, _error);
  }

  return (
    <TextField
      fullWidth
      required
      label={props.label}
      name={props.label}
      value={props.value}
      error={props.error.length > 0}
      helperText={props.error}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        handleChangeField(e);
      }}
    />
  );
}

/** TextField with validation */
export function ValidatedTextField(props: FieldProps) {
  function handleChangeField(e: ChangeEvent<HTMLInputElement>) {
    const _error =
      e.target.value.trim().length === 0 ? `${props.label} required` : '';
    props.onChange(e.target.value, _error);
  }

  return (
    <TextField
      fullWidth
      required
      label={props.label}
      name={props.label}
      value={props.value}
      error={props.error.length > 0}
      helperText={props.error}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        handleChangeField(e);
      }}
    />
  );
}

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  options: (SelectOption | string)[];
  value: string;
  error: string;
  onChange: (value: string, error: string) => void;
};

/**
 * Select form field with basic validations, working any options.
 */
export function SelectField(props: SelectFieldProps) {
  function convertToOption(str: string) {
    return { label: str, value: str } as SelectOption;
  }

  // The options can either be list of string or SelectOption.
  // When the option is in string, transform it to SelectOption.
  let sortedOptions: SelectOption[] = [];
  if (props.options.length > 0) {
    sortedOptions =
      typeof props.options[0] === 'string'
        ? (props.options as string[]).map((s) => convertToOption(s))
        : (props.options as SelectOption[]);

    // Add the none option at the beginning
    const noneOption = { label: 'None', value: '' } as SelectOption;
    sortedOptions = [
      noneOption,
      ...sortedOptions.toSorted((a, b) => {
        return a.label.localeCompare(b.label);
      }),
    ];
  }

  function handleChangeField(e: SelectChangeEvent) {
    const error =
      e.target.value.trim().length === 0 ? `${props.label} required` : '';
    props.onChange(e.target.value, error);
  }

  return (
    <FormControl fullWidth required>
      <InputLabel
        id={`${props.label}-select`}
        className={
          // Couldn't find a built-in way to make Select behave like TextField.
          props.error.length > 0 ? 'text-red-600 peer-focus:text-red-600' : ''
        }
      >
        {props.label}
      </InputLabel>
      <Select
        labelId={`${props.label}-select`}
        label={props.label}
        value={props.value}
        error={props.error.length > 0}
        onChange={(e: SelectChangeEvent) => {
          handleChangeField(e);
        }}
      >
        {sortedOptions.map((option) => (
          <MenuItem value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
      {props.error.length > 0 && (
        // Like defaultText in TextField component
        <Typography className="mt-1 ml-4 text-xs text-red-600">
          {props.error}
        </Typography>
      )}
    </FormControl>
  );
}

/**
 * Date time field. Currently, it doesn't have any validations.
 */
export function DateTimeField(props: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        slotProps={{ textField: { fullWidth: true } }}
        label={props.label}
        value={props.value && props.value !== '' ? dayjs(props.value) : null}
        onChange={(e: PickerValue) => {
          if (e) {
            // Value is in ISO string to send to the backend
            props.onChange(e.toISOString());
          }
        }}
      />
    </LocalizationProvider>
  );
}

type AccountFormProps = {
  type: 'CREATE' | 'UPDATE';
  open: boolean;
  currentData: CreateAccountBody | null;
  accountType: 'Credit' | 'Debit';
  onClose: () => void;
  onSubmit: (data: CreateAccountBody) => void;
};

/**
 * Form to create or update financial account
 */
export default function AccountForm(props: AccountFormProps) {
  const [data, setData] = useState(
    props.currentData ?? defaultCreateAccountBody(props.accountType),
  );
  const [error, setError] = useState(defaultCreateAccountError());
  const openBanner = useBanner();

  // Reset the data and the error when closing or opening the form
  useEffect(() => {
    if (props.open) {
      setData(props.currentData ?? defaultCreateAccountBody(props.accountType));
      setError(defaultCreateAccountError());
    }
  }, [props.open, props.currentData]);

  /**
   * Do the last round of the validating and then submit the data
   */
  function handleSubmit() {
    let canSubmit = true;
    Object.keys(data).forEach((key) => {
      if (
        // CreateAccountBody and CreateAccountError share identical fields,
        // check both simultaneously
        data[key as keyof CreateAccountBody] === '' ||
        error[key as keyof CreateAccountError] !== ''
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
      // Internal error.
      // Recheck the field naming when this happens
      throw new Error('Invalid field, not in data or error: ' + field);
    }
    setData({ ...data, [field]: value });
    setError({ ...error, [field]: _error });
  }

  return (
    <Dialog
      data-cy="account-form"
      open={props.open}
      onClose={props.onClose}
      slotProps={{
        paper: {
          className: 'bg-blue-200 p-4 rounded-xl shadow-lg',
        },
      }}
    >
      <DialogTitle variant="h5" className="font-bold text-center mb-2">
        {props.type} {props.accountType.toLocaleUpperCase()} ACCOUNTS
      </DialogTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedNumberField
            label="Account number"
            value={data.acc_number}
            error={error.acc_number}
            onChange={(value, error) => {
              setField('acc_number', value, error);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedTextField
            label="Account name"
            value={data.acc_name}
            error={error.acc_name}
            onChange={(value, error) => setField('acc_name', value, error)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            options={Institutions}
            label="Institution"
            value={data.institution}
            error={error.institution}
            onChange={(value, error) => setField('institution', value, error)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ValidatedNumberField
            label="Balance"
            value={data.balance}
            error={error.balance}
            onChange={(value, error) => setField('balance', value, error)}
          />
        </Grid>
        {props.accountType === 'Credit' && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ValidatedNumberField
              label="Credit limit"
              value={data.credit_limit ?? ''}
              error={error.credit_limit}
              onChange={(value, error) =>
                setField('credit_limit', value, error)
              }
            />
          </Grid>
        )}
        {props.accountType === 'Credit' && (
          <Grid size={{ xs: 12, md: 6 }}>
            <DateTimeField
              label="Credit due"
              value={data.next_due}
              onChange={(value) => setField('next_due', value, '')}
            />
          </Grid>
        )}
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
