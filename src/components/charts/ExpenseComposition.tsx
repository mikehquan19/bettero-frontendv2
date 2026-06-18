'use client';

import { CategoryInfo } from '@interface';
import { Box } from '@mui/material';
import { Chart as ChartJS } from 'chart.js';
import { Pie, getElementAtEvent } from 'react-chartjs-2';
import { MouseEvent, useEffect, useRef, useState } from 'react';

export default function ExpenseComposition(props: {
  periodType?: string;
  percentages: CategoryInfo;
  deselectSignal: 'DESELECT' | undefined;
  onSelectCategory: (category: string) => void;
  onDeselect: () => void;
  onResetSignal: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const chartRef = useRef<ChartJS<'pie'> | null>(null);

  useEffect(() => {
    if (props.deselectSignal === 'DESELECT') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(-1);
      props.onResetSignal();
    }
  }, [props, props.deselectSignal]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Composition percentage this ${props.periodType ?? 'month'}`,
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

  const mainColors = [
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
  const backgroundColors = mainColors.map((mainColor, index) => {
    return index === selectedIndex ? '#332f27' : mainColor;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Composition (%)',
        data: percentages,
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 1,
        // Hover properties
        hoverOffset: 10,
        hoverBackgroundColor: '#332f27',
        hoverBorderWidth: 2,
      },
    ],
  };

  function handleClick(event: MouseEvent<HTMLCanvasElement>) {
    if (chartRef.current) {
      const newSlice = getElementAtEvent(chartRef.current, event);
      if (newSlice.length) {
        const { index: newIndex } = newSlice[0];
        if (newIndex !== selectedIndex) {
          setSelectedIndex(newIndex);
          const category = data.labels[newIndex];
          props.onSelectCategory(category);
        } else {
          setSelectedIndex(-1);
          props.onDeselect();
        }
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
