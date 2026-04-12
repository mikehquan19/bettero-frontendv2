import { categories } from '@/interface';
import { Box } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type ExpenseCompositionProps = {
  percentages: (number | null)[] | null;
};

export default function ExpenseComposition(props: ExpenseCompositionProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Composition percentage this month',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
      },
    },
  };

  const labels = categories.map((c) => c);
  const percentages =
    props.percentages && props.percentages.length == labels.length
      ? props.percentages
      : [10, 10, 10, 10, 10, 10, 10, 10, 20];

  const backgroundColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(255, 132, 132, 1)',
    'rgba(125, 162, 235, 1)',
    'rgba(55, 100, 186, 1)',
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Composition (%)',
        data: percentages,
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: 420,
      }}
    >
      <Pie options={options} data={data} />
    </Box>
  );
}
