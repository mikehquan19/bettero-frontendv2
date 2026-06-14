'use client';

import { CategoryInfo } from '@interface';
import { Box } from '@mui/material';
import { Chart as ChartJS } from 'chart.js';
import { Pie, getElementAtEvent } from 'react-chartjs-2';
import { MouseEvent, useEffect, useRef } from 'react';

export default function ExpenseComposition(props: {
  periodType?: string;
  percentages: CategoryInfo;
  onChangeCategory: (category: string) => void;
}) {
  const chartRef = useRef<ChartJS<'pie'> | null>(null);

  useEffect(() => {
    // Expose chart instance for Cypress E2E.
    // Avoid relying on global registry or DOM parsing.
    // Still really flaky and doesn't handle the test cases really well
    if (window.Cypress) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__expenseCompositionChart = chartRef.current;
    }
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: [`Composition percentage this ${props.periodType ?? 'month'}`],
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

  const backgroundColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF8484',
    '#7DA2EB',
    '#3764BA',
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

  function handleClick(event: MouseEvent<HTMLCanvasElement>) {
    if (chartRef.current) {
      const elements = getElementAtEvent(chartRef.current, event);
      if (elements.length) {
        const { index } = elements[0];
        const category = data.labels[index];
        props.onChangeCategory(category);
      }
    }
  }

  return (
    <Box className="w-full h-[420]">
      <Pie
        data-cy="expense-composition-chart"
        ref={chartRef}
        options={options}
        data={data}
        onClick={handleClick}
      />
    </Box>
  );
}
