'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Account, PageLimit, PaginatedData, Transaction } from '@/interface';
import { createContext, useContext, useState } from 'react';
import {
  CreateTransactionBody,
  UpdateTransactionBody,
} from './TransactionForm';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import TransactionDelete from './TransactionDelete';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/lib/fetchTransactions';
import { useBanner } from '../snackbar/BannerProvider';

type TransactionActionContextProps = {
  allowActions: boolean;
  chooseCreate: () => void;
  chooseUpdate: (id: number, data: CreateTransactionBody) => void;
  chooseDelete: (id: number) => void;
  searchTransactions: (q: string | null) => void;
};
const TransactionActionsContext = createContext<TransactionActionContextProps>({
  // Dummy functions
  allowActions: false,
  chooseCreate: () => {},
  chooseUpdate: (id, data) => {},
  chooseDelete: (id) => {},
  searchTransactions: (q) => {},
});

/**
 * Custom hook to get the available actions on transaction.
 * If the table isn't wrapped by a provider, then it uses dummy functions, which does nothing
 */
export function useTransactionActions() {
  return useContext(TransactionActionsContext);
}

type ContainerProps = {
  accounts: Account[];
  paginatedTransactions: PaginatedData<Transaction[]>;
};

/**
 * The context provider that takes actions of the transaction table.
 */
export default function TransactionContainer(props: ContainerProps) {
  const [formState, setFormState] = useState<{
    open: boolean;
    type: 'CREATE' | 'UPDATE';
  }>({
    open: false,
    type: 'CREATE',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number>(-1);
  const [currentData, setCurrentData] = useState<CreateTransactionBody | null>(
    null,
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const openBanner = useBanner();

  /**
   * Convert the create body updated from update-form for API
   */
  function convertToUpdateBody(createBody: CreateTransactionBody) {
    return {
      merchant: createBody.merchant,
      tran_description: createBody.tran_description,
      category: createBody.category,
      amount: createBody.amount,
      created_at: createBody.created_at,
    } as UpdateTransactionBody;
  }

  /**
   * Depending the current page, move to new page
   */
  function handlePageChange(
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset > 0) {
      params.set('offset', newOffset.toString());
    } else {
      params.delete('offset');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  /**
   * Submit the form to either create or update the transaction
   */
  async function handleSubmitForm(data: CreateTransactionBody) {
    let message = '';

    if (formState.type === 'CREATE') {
      const created = await createTransaction(data);
      message = `${created.tran_description} created successfully!`;

      // Move all back to the first page
      const params = new URLSearchParams(searchParams.toString());
      params.delete('offset');
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      const updated = await updateTransaction(
        currentId,
        convertToUpdateBody(data),
      );
      message = `${updated.tran_description} updated successfully!`;
    }
    router.refresh();
    openBanner(message);
    setFormState({ open: false, type: formState.type });
  }

  /**
   * Delete the transaction
   */
  async function handleSubmitDialog() {
    let message = '';

    message = await deleteTransaction(currentId);
    router.refresh();
    openBanner(message);
    setDialogOpen(false);
  }

  /**
   * Search for transaction with description
   */
  function searchTransactions(q: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (q && q.length > 0) {
      params.set('q', q);
    } else {
      params.delete('q');
    }

    // Move to the first page of searched transactions
    params.delete('offset');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <TransactionActionsContext.Provider
      value={{
        allowActions: true,
        chooseCreate: () => setFormState({ open: true, type: 'CREATE' }),
        chooseUpdate: (id: number, data: CreateTransactionBody) => {
          setCurrentId(id);
          setCurrentData(data);
          setFormState({ open: true, type: 'UPDATE' });
        },
        chooseDelete: (id: number) => {
          setCurrentId(id);
          setDialogOpen(true);
        },
        searchTransactions: searchTransactions,
      }}
    >
      <TransactionTable
        paginatedTransactions={props.paginatedTransactions}
        onPageChange={handlePageChange}
      />
      <TransactionForm
        type={formState.type as 'CREATE' | 'UPDATE'}
        open={formState.open}
        currentData={formState.type === 'CREATE' ? null : currentData}
        accounts={props.accounts}
        onClose={() => setFormState({ open: false, type: formState.type })}
        onSubmit={handleSubmitForm}
      />
      <TransactionDelete
        open={dialogOpen}
        id={currentId}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitDialog}
      />
    </TransactionActionsContext.Provider>
  );
}
