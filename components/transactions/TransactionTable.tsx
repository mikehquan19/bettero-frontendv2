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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import { MouseEvent, SyntheticEvent, useEffect, useState } from 'react';
import {
  PageLimit,
  PaginatedData,
  Transaction,
  AutocompleteOptions,
} from '@/interface';
import { CreateTransactionBody } from './TransactionForm';
import { useTransactionActions } from './TransactionContainer';

function TransactionSearchBar() {
  const [keyword, setKeyword] = useState<string>('');
  const [descriptions, setDescriptions] = useState<string[]>([]);

  const { searchTransactions } = useTransactionActions();

  useEffect(() => {
    if (keyword.length > 0) {
      const matched = AutocompleteOptions.filter((o) =>
        o.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
      );
      const descriptions = matched.length > 0 ? matched : [keyword];
      setDescriptions(descriptions);
    } else {
      setDescriptions([]);
    }
  }, [keyword]);

  return (
    <div className="flex flex-row">
      <Autocomplete
        size="small"
        freeSolo
        options={descriptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search with keyword"
            sx={{
              width: '250px',
              '& .MuiOutlinedInput-root': {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              },
            }}
          />
        )}
        slotProps={{
          paper: {
            className: 'bg-blue-100 rounded-b-lg rounded-t-none',
          },
        }}
        onInputChange={(e: SyntheticEvent, value: string) => {
          e.preventDefault();
          setKeyword(value);
        }}
        onChange={(e: SyntheticEvent, value: string | null) => {
          e.preventDefault();
          searchTransactions(value);
        }}
      />
      <Tooltip title="Search">
        <Button
          className="rounded-r-lg rounded-l-none"
          variant="contained"
          onClick={() => {
            // Click the button to search for the current keyword
            if (keyword.length > 0) {
              searchTransactions(keyword);
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
      amount: transaction.amount,
      created_at: new Date(transaction.created_at).toISOString(),
    } as CreateTransactionBody;
  }

  return (
    <TableBody>
      {props.transactions.map((transaction) => (
        <TableRow key={transaction.id} hover>
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
            if (selectedTransaction) {
              chooseUpdate(
                selectedTransaction.id,
                convertToCreateBody(selectedTransaction)!,
              );
            }
            setAnchorEl(null);
          }}
          onChooseDelete={() => {
            if (selectedTransaction) {
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
              onPageChange={props.onPageChange}
              countPerPage={PageLimit}
            />
          </Table>
        </TableContainer>
      </Paper>
      {allowActions && (
        <>
          <Stack direction="row" className="justify-center mt-2">
            <Tooltip title="Add transaction">
              <IconButton id="add-transaction">
                <AddCircleIcon
                  fontSize="large"
                  onClick={() => chooseCreate()}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      )}
    </>
  );
}
