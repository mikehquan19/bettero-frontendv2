
export interface FinancialInfo {
  totalBalance: number,
  totalDue: number,
  totalIncome: number,
  totalExpense: number
}

export interface Account {
  id: number,
  accountNumber: number,
  name: string,
  institution: string,
  accountType: 'Debit' | 'Credit',
  balance: number,
  creditLimit: number | null,
  creditDueAt: Date | null,
  createdAt: Date,
  updatedAt: Date,
}

export interface Transaction {
  id: number,
  account: Account,
  merchant: string,
  description: string,
  category: string
  amount: number,
  createdAt: Date,
  updatedAt: Date,
}

export interface Bill {
  id: number,
  account: Account,
  institution: string,
  description: string,
  category: string,
  amount: number,
  dueAt: Date,
  createdAt: Date,
  updatedAt: Date,
  recurring: Boolean,
}

export interface OverdueMessage {
  id: number,
  bill: Bill,
  amount: number,
  dueAt: Date,
  createdAt: Date
}

export interface Stock {
  id: number,
  corporation: string,
  name: string,
  ticker: string,
  numShares: number,
  previousClose: number,
  currentClose: number,
  change: number,
  open: number,
  low: number,
  high: number,
  volume: number,
  createdAt: Date,
  updatedAt: Date
}

export interface BudgetPlan {
  income: number,
  expensePortion: number,
  composition: BudgetComposition,
  progress: CategoryObject
}

export interface CategoryObject {
  gas: number | CategoryProgress,
  dining: number | CategoryProgress,
  others: number | CategoryProgress,
  grocery: number | CategoryProgress,
  housing: number | CategoryProgress,
  medical: number | CategoryProgress,
  shopping: number | CategoryProgress,
  automobile: number | CategoryProgress,
  subscription: number | CategoryProgress
}

export interface BudgetComposition {
  goal: CategoryObject,
  actual: CategoryObject
}

export interface CategoryProgress {
  budget: number,
  current: number,
  percentage: number
}