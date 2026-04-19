type CardTheme = {
  background: string;
  primary: string;
};

const bankToTheme: Record<string, CardTheme> = {
  'Bank of America': {
    background: 'bg-gray-400',
    primary: 'text-white',
  },
  'JP Morgan Chase': {
    background: 'bg-[#1A237E]',
    primary: 'text-white',
  },
  'Wells Fargo': {
    background: 'bg-[#D71E28]',
    primary: 'text-white',
  },
  'Citi Bank': {
    background: 'bg-[#003B70]',
    primary: 'text-white',
  },
  'Capital One': {
    background: 'bg-[#004879]',
    primary: 'text-white',
  },
  Discover: {
    background: 'bg-[#E55C20]',
    primary: 'text-white',
  },
  'Sofi Bank': {
    background: 'bg-[#00A3E0]',
    primary: 'text-white',
  },
  'Ally Bank': {
    background: 'bg-[#5F259F]',
    primary: 'text-white',
  },
};

export default bankToTheme;
