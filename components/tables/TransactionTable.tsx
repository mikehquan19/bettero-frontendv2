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
import { Transaction } from '@/interface';

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
  transactions: Transaction[];
};

export default function TransactionTable(props: TransactionTableProps) {
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const transactions = props.transactions;
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
            List of transactions ({transactions.length}):
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
              {transactions.map((transaction) => (
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
          count={100}
          page={page}
          onPageChange={() => null}
          rowsPerPage={20}
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
