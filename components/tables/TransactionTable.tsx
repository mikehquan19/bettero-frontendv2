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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from 'react';
import { PaginatedData, Transaction } from '@/interface';
import { useRouter, useSearchParams } from 'next/navigation';

type TransactionMenuProps = {
  id: string;
  controlButton: string;
  anchorEl: any;
  open: boolean;
  onClose: () => void;
};

function TransactionMenu(props: TransactionMenuProps) {
  const { id, controlButton, anchorEl, open, onClose } = props;
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        list: {
          'aria-labelledby': controlButton,
        },
      }}
    >
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <ModeEditIcon />
        </ListItemIcon>
        <ListItemText>Update</ListItemText>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <DeleteForeverIcon />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
}

type TransactionTableProps = {
  paginatedTrans: PaginatedData<Transaction[]>;
};

export default function TransactionTable(props: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);

  const paginatedTrans = props.paginatedTrans;
  const limit = 20;
  const currPage = Math.floor(paginatedTrans.offset / limit);

  function handlePageChange(
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * limit;
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <Paper
        sx={{
          backgroundColor: '#BFDBFE',
          borderRadius: '0.75rem',
        }}
      >
        <Box
          sx={{
            bgcolor: 'grey.400',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            List of transactions ({paginatedTrans.total}):
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
                ].map((attr) => (
                  <TableCell key={attr}>
                    <Typography fontWeight={550}>{attr}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTrans.data.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography>
                      {transaction.account.institution}'s{' '}
                      {transaction.account.acc_name}
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
                      {
                        new Date(transaction.created_at)
                          .toISOString()
                          .split('T')[0]
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="See actions on transaction">
                      <IconButton
                        id="see-actions"
                        aria-controls={
                          anchorEl ? 'transaction-actions' : undefined
                        }
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
          </Table>
        </TableContainer>
        {/* Table pagination */}
        <TablePagination
          component="div"
          count={paginatedTrans.total}
          page={currPage}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          rowsPerPageOptions={[]}
        />
      </Paper>
      <Stack direction="row" justifyContent="center" mt={1}>
        <Tooltip title="Add transaction">
          <IconButton id="add-transaction">
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}
