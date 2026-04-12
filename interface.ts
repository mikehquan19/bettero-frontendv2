export type FinancialInfo = {
  totalBalance: number;
  totalDue: number;
  totalIncome: number;
  totalExpense: number;
};

export type Account = {
  id: number;
  user_id: number;
  acc_number: number;
  acc_name: string;
  institution: string;
  type: 'Debit' | 'Credit';
  balance: number;
  credit_limit: number | null;
  next_due: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type transaction = {
  id: number;
  account: {
    id: number;
    acc_number: number;
    acc_name: string;
    institution: string;
    type: string;
  };
  merchant: string;
  tran_description: string;
  category: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
};

export type Bill = {
  id: number;
  account: {
    id: number;
    acc_number: number;
    acc_name: string;
    institution: string;
    type: string;
  };
  merchant: string;
  description: string;
  category: string;
  amount: number;
  dueDate: Date;
};

export type OverdueMessage = {
  id: number;
  bill: Bill;
  amount: number;
  dueAt: Date;
  createdAt: Date;
};

export type Stock = {
  id: number;
  corporation: string;
  name: string;
  ticker: string;
  numShares: number;
  previousClose: number;
  currentClose: number;
  change: number;
  open: number;
  low: number;
  high: number;
  volume: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BudgetPlan = {
  income: number;
  expensePortion: number;
  composition: BudgetComposition;
  progress: CategoryObject;
};

export type CategoryObject = {
  gas: number | CategoryProgress;
  dining: number | CategoryProgress;
  others: number | CategoryProgress;
  grocery: number | CategoryProgress;
  housing: number | CategoryProgress;
  medical: number | CategoryProgress;
  shopping: number | CategoryProgress;
  automobile: number | CategoryProgress;
  subscription: number | CategoryProgress;
};

export type BudgetComposition = {
  goal: CategoryObject;
  actual: CategoryObject;
};

export type CategoryProgress = {
  budget: number;
  current: number;
  percentage: number;
};

export const categories = [
  'Gas',
  'Dining',
  'Grocery',
  'Housing',
  'Medical',
  'Shopping',
  'Automobile',
  'Subscription',
  'Others',
];
