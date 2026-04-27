export type PaginatedData<T> = {
  total: number;
  offset: number;
  data: T;
};

export type BasicInfo = {
  total_balance: number;
  total_amount_due: number;
  total_income: number;
  total_expense: number;
};

export type CategoryInfo = {
  Automobile: number | null;
  Dining: number | null;
  Gas: number | null;
  Grocery: number | null;
  Housing: number | null;
  Medical: number | null;
  Others: number | null;
  Shopping: number | null;
  Subscription: number | null;
};

export type AnalysisInfo = {
  basic: BasicInfo;
  daily: Record<string, number>;
  change: CategoryInfo;
  composition: CategoryInfo;
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

export type Transaction = {
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
  'Income',
  'Housing',
  'Automobile',
  'Medical',
  'Subscription',
  'Grocery',
  'Dining',
  'Shopping',
  'Gas',
  'Others',
];

export const PageLimit = 15;

export const AutocompleteOptions = [
  'Uber txn #8643',
  'Starbucks txn #1657',
  'Costco txn #928',
  'Starbucks txn #6501',
  'Target txn #4589',
  'Uber txn #5252',
  'Amazon txn #8771',
  'Shell txn #7811',
  'Walmart txn #9745',
  'Uber txn #8173',
  'McDonalds txn #2897',
  'Costco txn #2684',
  'Netflix txn #2058',
  'Starbucks txn #2649',
  'Netflix txn #3994',
];

export const BASE_URL = 'http://localhost:8080';
