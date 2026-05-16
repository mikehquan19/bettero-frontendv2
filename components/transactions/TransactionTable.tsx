'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Stack,
  Paper,
  Menu,
  MenuItem,
  TableFooter,
  Autocomplete,
  TextField,
  Button,
  Box,
  AutocompleteInputChangeReason,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import { MouseEvent, SyntheticEvent, useEffect, useState } from 'react';
import { PaginatedData, Transaction, CreateTransactionBody } from '@/interface';
import { PageLimit, BASE_URL } from '@/constant';
import { useTransactionActions } from './TransactionContainer';
import useSWR from 'swr';

type Suggestion = {
  name: string;
  type: string;
};

function TransactionSearchBar() {
  const [keyword, setKeyword] = useState<string>('');
  const [descriptions, setDescriptions] = useState<Suggestion[]>([]);

  const { searchTransactions } = useTransactionActions();

  // Fetcher function to get list of sugestions
  async function suggestionFetcher(keyword: string): Promise<Suggestion[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/transactions/autocomplete?q=${keyword}`,
        { method: 'GET' },
      );
      const resData = await res.json();
      if (resData.error !== '') {
        console.log(resData.error);
        return [];
      }

      return resData.data ?? [];
    } catch (error) {
      console.log(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
      return [];
    }
  }

  const { data, isValidating } = useSWR(
    keyword.length > 0 ? keyword : null,
    suggestionFetcher,
    { keepPreviousData: true },
  );

  useEffect(() => {
    // Keep the current options until new ones have been loaded, avoid flickering
    if (keyword.length > 0) {
      // When the options have been fetched and validated, use them
      if (!isValidating && data !== undefined) {
        setDescriptions(data);
      }
    } else {
      setDescriptions([]);
    }
  }, [keyword, data, isValidating]);

  return (
    <div className="flex flex-row">
      <Autocomplete
        size="small"
        freeSolo
        autoHighlight
        options={descriptions}
        inputValue={keyword} // Control the keyword
        slotProps={{
          paper: {
            className: 'bg-blue-100 rounded-b-lg rounded-t-none',
          },
        }}
        filterOptions={(options) => options} // If we don't do this, it will filter
        getOptionLabel={(option: string | Suggestion) => {
          // The options should always be Suggestion instead of string
          // MUI's type safety
          if (typeof option === 'string') {
            return option;
          }
          return option.name;
        }}
        renderOption={(props, option: string | Suggestion) => {
          const { key, ...optionProps } = props;
          const optionType =
            typeof option === 'string'
              ? null
              : option.type.charAt(0).toUpperCase() + option.type.slice(1); // Capitalize
          return (
            // Render the suggestion along with its option field
            <Box key={key} component="li" {...optionProps}>
              <Stack direction="column">
                {optionType !== null && (
                  <Typography className="text-xs text-gray-500">
                    {optionType}
                  </Typography>
                )}
                <Typography>
                  {typeof option === 'string' ? option : option.name}
                </Typography>
              </Stack>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search with keyword"
            sx={{
              width: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px 0 0 8px',
              },
            }}
          />
        )}
        onInputChange={(
          e: SyntheticEvent<Element, Event>,
          value: string,
          reason: AutocompleteInputChangeReason,
        ) => {
          e.preventDefault();
          setKeyword(value);
          if (reason === 'clear' && searchTransactions) {
            // Clear the input, reset the transactions data.
            // Value is technically empty
            searchTransactions('description', value);
          }
        }}
        onChange={(
          e: SyntheticEvent<Element, Event>,
          value: Suggestion | string | null,
        ) => {
          e.preventDefault();
          if (!value || typeof value === 'string') {
            // Options should always be defined suggestions MUI's safety
            return;
          }
          if (searchTransactions) {
            searchTransactions(
              value.type as 'merchant' | 'description',
              value.name,
            );
          }
        }}
      />
      <Tooltip title="Search">
        <Button
          disableElevation
          className="rounded-r-lg rounded-l-none"
          variant="contained"
          onClick={() => {
            // If the current keyword has the list of suggestions,
            // search for first one on click
            if (descriptions.length > 0) {
              setKeyword(descriptions[0].name);
              if (searchTransactions) {
                searchTransactions(
                  descriptions[0].type as 'merchant' | 'description',
                  descriptions[0].name,
                );
              }
            }
          }}
        >
          <SearchIcon />
        </Button>
      </Tooltip>
    </div>
  );
}

function TransactionTableHead() {
  const { allowActions } = useTransactionActions();
  const columns = [
    'Account',
    'Merchant',
    'Description',
    'Category',
    'Amount',
    'Created At',
  ];
  if (allowActions) columns.push('');
  return (
    <TableHead>
      <TableRow>
        {columns.map((tranAttr) => (
          <TableCell key={tranAttr}>
            <Typography className="font-bold">{tranAttr}</Typography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

type TransactionMenuProps = {
  id: string;
  controlButton: string;
  anchorEl: any;
  open: boolean;
  onClose: () => void;
  onChooseUpdate: () => void;
  onChooseDelete: () => void;
};

/** Menu to take actions on the transaction */
function TransactionTableBodyMenu(props: TransactionMenuProps) {
  return (
    <Menu
      id={props.id}
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.onClose}
      slotProps={{
        list: {
          'aria-labelledby': props.controlButton,
        },
        paper: {
          className: 'bg-blue-100',
        },
      }}
    >
      <MenuItem onClick={props.onChooseUpdate}>
        <ListItemIcon>
          <ModeEditIcon />
        </ListItemIcon>
        <ListItemText>Update</ListItemText>
      </MenuItem>
      <MenuItem onClick={props.onChooseDelete}>
        <ListItemIcon>
          <DeleteForeverIcon />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
}

function TransactionTableBody(props: { transactions: Transaction[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { allowActions, chooseUpdate, chooseDelete } = useTransactionActions();

  /** Convert transaction to create body to pass to the update form */
  function convertToCreateBody(transaction: Transaction) {
    return {
      account_id: transaction.account.id.toString(),
      merchant: transaction.merchant,
      tran_description: transaction.tran_description,
      category: transaction.category,
      amount: String(transaction.amount),
      created_at: new Date(transaction.created_at).toISOString(),
    } as CreateTransactionBody;
  }

  return (
    <TableBody>
      {props.transactions.map((transaction) => (
        <TableRow data-cy="transaction-row" key={transaction.id} hover>
          <TableCell>
            <Typography>
              {transaction.account.institution}'s {transaction.account.acc_name}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography>{transaction.merchant}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{transaction.tran_description}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{transaction.category}</Typography>
          </TableCell>
          <TableCell>
            <Typography>${transaction.amount}</Typography>
          </TableCell>
          <TableCell>
            <Typography>
              {new Date(transaction.created_at).toISOString().split('T')[0]}
            </Typography>
          </TableCell>
          {allowActions && (
            <TableCell>
              <Tooltip title="See actions on transaction">
                <IconButton
                  id="see-actions"
                  aria-controls={anchorEl ? 'transaction-actions' : undefined}
                  aria-haspopup="true"
                  aria-expanded={anchorEl ? 'true' : undefined}
                  onClick={(event: MouseEvent<HTMLElement>) => {
                    setAnchorEl(event.currentTarget);
                    setSelectedTransaction(transaction);
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          )}
        </TableRow>
      ))}
      {allowActions && (
        <TransactionTableBodyMenu
          id="transaction-actions"
          controlButton="see-actions"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onChooseUpdate={() => {
            if (selectedTransaction && chooseUpdate) {
              chooseUpdate(
                selectedTransaction.id,
                convertToCreateBody(selectedTransaction),
              );
            }
            setAnchorEl(null);
          }}
          onChooseDelete={() => {
            if (selectedTransaction && chooseDelete) {
              chooseDelete(selectedTransaction.id);
            }
            setAnchorEl(null);
          }}
        />
      )}
    </TableBody>
  );
}

type PaginationFooterProps = {
  totalCount: number;
  page: number;
  countPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
};

function PaginationFooter(props: PaginationFooterProps) {
  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={7} className="p-1">
          <TablePagination
            component="div"
            count={props.totalCount}
            page={props.page}
            rowsPerPage={props.countPerPage}
            rowsPerPageOptions={[]}
            onPageChange={props.onPageChange}
          />
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}

/**
 * Table that only displays the list of paginated transactions.
 * It does not take the actions (create, update, delete a transaction),
 * but interacts with the context provider that do it.
 *
 * When used directly, interactions with context provider is not enabled.
 */
export default function TransactionTable(props: {
  paginatedTransactions: PaginatedData<Transaction[]>;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
}) {
  const { allowActions, chooseCreate } = useTransactionActions();

  const currentPage = Math.floor(
    props.paginatedTransactions.offset / PageLimit,
  );

  return (
    <>
      <Paper className="bg-blue-200 rounded-xl">
        <Stack
          direction="row"
          className="bg-gray-400 text-white rounded-t-xl p-3 items-center justify-between"
        >
          <Typography variant="h6" className="font-bold">
            List of transactions ({props.paginatedTransactions.total}):
          </Typography>
          {allowActions && <TransactionSearchBar />}
        </Stack>
        <TableContainer>
          <Table
            sx={{
              minWidth: 1000,
              '& .MuiTableRow-root': {
                borderTop: '0.1rem solid rgba(0,0,0,0.12)',
              },
              '& .MuiTableRow-root:last-child td, & .MuiTableRow-root:last-child th':
                {
                  borderBottom: 'none',
                },
            }}
          >
            <TransactionTableHead />
            <TransactionTableBody
              transactions={props.paginatedTransactions.data}
            />
            <PaginationFooter
              totalCount={props.paginatedTransactions.total}
              page={currentPage}
              countPerPage={PageLimit}
              onPageChange={props.onPageChange}
            />
          </Table>
        </TableContainer>
      </Paper>
      {allowActions && (
        <Stack direction="row" className="justify-center mt-2">
          <Tooltip title="Add transaction">
            <IconButton id="add-transaction">
              <AddCircleIcon
                fontSize="large"
                onClick={() => {
                  if (chooseCreate) chooseCreate();
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </>
  );
}
