export const BASE_URL = 'http://localhost:8080';

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

export const Institutions = [
  'Bank of America',
  'JP Morgan Chase',
  'Wells Fargo',
  'Citi Bank',
  'Capital One',
  'Discover',
  'Sofi Bank',
  'Ally Bank',
];

type CardTheme = {
  background: string;
  primary: string;
};

/** Map from bank to their tailwind color */
export const BankToTheme: Record<string, CardTheme> = {
  'Bank of America': {
    background: 'bg-gray-400',
    primary: 'text-white',
  } as CardTheme,
  'JP Morgan Chase': {
    background: 'bg-[#1A237E]',
    primary: 'text-white',
  } as CardTheme,
  'Wells Fargo': {
    background: 'bg-[#D71E28]',
    primary: 'text-white',
  } as CardTheme,
  'Citi Bank': {
    background: 'bg-[#003B70]',
    primary: 'text-white',
  } as CardTheme,
  'Capital One': {
    background: 'bg-[#004879]',
    primary: 'text-white',
  } as CardTheme,
  Discover: {
    background: 'bg-[#E55C20]',
    primary: 'text-white',
  } as CardTheme,
  'Sofi Bank': {
    background: 'bg-[#00A3E0]',
    primary: 'text-white',
  } as CardTheme,
  'Ally Bank': {
    background: 'bg-[#5F259F]',
    primary: 'text-white',
  } as CardTheme,
};
