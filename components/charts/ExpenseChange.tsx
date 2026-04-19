'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box } from '@mui/material';
import { categories } from '@/interface';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type ExpenseChangeProps = {
  percentages: (number | null)[] | null;
};

export default function ExpenseChange(props: ExpenseChangeProps) {
  const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Change percentage from previous month',
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
      : [-20, 30, -10, -15, null, 25, 0, 10, 5];
  const colors = percentages.map((percentage) => {
    if (percentage) {
      if (percentage > 0) {
        return 'rgb(255, 99, 132)';
      } else {
        return 'rgb(99, 132, 255)';
      }
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Change (%)',
        data: percentages,
        borderColor: colors,
        backgroundColor: colors,
      },
    ],
  };

  return (
    <Box className="w-full h-[420]">
      <Bar options={options} data={data} />
    </Box>
  );
}
