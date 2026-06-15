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
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Box } from '@mui/material';
import { CategoryInfo } from '@interface';

// This registers on the global level, so it will be applied to every other charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function ExpenseChange(props: {
  periodType?: string;
  percentages: CategoryInfo;
}) {
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
        text: `Change percentage from previous to this ${props.periodType ?? 'month'}`,
        font: {
          size: 20,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          lineWidth: 1.75,
          color: 'rgba(17, 24, 39, 0.12)',
        },
      },
      y: {
        grid: {
          display: false,
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
        borderColor: 'white',
        borderWidth: 1,
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
