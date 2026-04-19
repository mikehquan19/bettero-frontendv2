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
  Box,
  Paper,
  Menu,
  MenuItem,
  TableFooter,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from 'react';
import { PaginatedData, Transaction } from '@/interface';
import { useRouter, useSearchParams } from 'next/navigation';

function TransactionTableHead() {
  return (
    <TableHead>
      <TableRow>
        {[
          'Account',
          'Merchant',
          'Description',
          'Category',
          'Amount',
          'Created At',
          '',
        ].map((tranAttr) => (
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
};

/** Menu to take actions on the transaction */
function TransactionMenu(props: TransactionMenuProps) {
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
      }}
    >
      <MenuItem onClick={props.onClose}>
        <ListItemIcon>
          <ModeEditIcon />
        </ListItemIcon>
        <ListItemText>Update</ListItemText>
      </MenuItem>
      <MenuItem onClick={props.onClose}>
        <ListItemIcon>
          <DeleteForeverIcon />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
}

function TransactionTableBody(props: { transactions: Transaction[] }) {
  const [anchorEl, setAnchorEl] = useState(null);
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
          <TableCell>
            <Tooltip title="See actions on transaction">
              <IconButton
                id="see-actions"
                aria-controls={anchorEl ? 'transaction-actions' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
                onClick={(event: any) => {
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
      <TransactionMenu
        id="transaction-actions"
        controlButton="see-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </TableBody>
  );
}

type PaginationFooterProps = {
  totalCount: number;
  page: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
  countPerPage: number;
};

function PaginationFooter(props: PaginationFooterProps) {
  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={7} className="p-1">
          {/* Table pagination */}
          <TablePagination
            component="div"
            count={props.totalCount}
            page={props.page}
            onPageChange={props.onPageChange}
            rowsPerPage={props.countPerPage}
            rowsPerPageOptions={[]}
          />
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}

export default function TransactionTable(props: {
  paginatedTrans: PaginatedData<Transaction[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const limit = 20;
  const currentPage = Math.floor(props.paginatedTrans.offset / limit);

  /**
   * Depending the current page, move to new page (in params)
   */
  function handlePageChange(
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * limit;
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <Paper className="bg-blue-200 rounded-xl">
        <Box className="bg-gray-400 text-white rounded-t-xl p-3">
          <Typography variant="h6" className="font-bold">
            List of transactions ({props.paginatedTrans.total}):
          </Typography>
        </Box>
        <TableContainer>
          <Table
            sx={{
              minWidth: 1000,
              '& .MuiTableRow-root': {
                borderBottom: '0.1rem solid rgba(0,0,0,0.12)',
              },
            }}
          >
            <TransactionTableHead />
            <TransactionTableBody transactions={props.paginatedTrans.data} />
            <PaginationFooter
              totalCount={props.paginatedTrans.total}
              page={currentPage}
              onPageChange={handlePageChange}
              countPerPage={limit}
            />
          </Table>
        </TableContainer>
      </Paper>
      <Stack direction="row" className="justify-center mt-2">
        <Tooltip title="Add transaction">
          <IconButton id="add-transaction">
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}
