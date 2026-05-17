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
import { CategoryInfo } from '@/src/interface';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function ExpenseChange(props: { percentages: CategoryInfo }) {
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

  const labels: string[] = [];
  const percentages: (number | null)[] = [];
  Object.entries(props.percentages).forEach(([key, value]) => {
    labels.push(key);
    percentages.push(value);
  });
  const colors = percentages.map((percentage) => {
    if (percentage) {
      if (percentage > 0) {
        return 'rgb(255, 99, 132)';
      } else {
        return 'rgb(52, 61, 95)';
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
