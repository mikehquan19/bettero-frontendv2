'use client';

import { Chart as ChartJS, TimeScale, TimeSeriesScale } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';
import 'chartjs-adapter-date-fns';

// Add the hover line register to chart
const HoverLinePlugin = {
  id: 'hoverLine',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    // Only affects the daily line chart
    if (chart.config.type === 'line' && chart.tooltip?._active?.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];

      const x = activePoint.element.x;
      const yAxis = chart.scales.y;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#9CA3AF';
      ctx.stroke();
      ctx.restore();
    }
  },
};
ChartJS.register(HoverLinePlugin, TimeScale, TimeSeriesScale);

export default function ExpenseDaily(props: {
  periodType?: string;
  dailyExpenses: Record<string, number>;
}) {
  const labels = Object.keys(props.dailyExpenses);
  const values = Object.values(props.dailyExpenses);

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Spending ($)',
        data: values,
        borderColor: '#4B5563',
        backgroundColor: '#4B5563',
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Total daily expenses for this ${props.periodType ?? 'month'}`,
        font: {
          size: 20,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        type: 'timeseries' as const,
        time: {
          unit: 'day' as const,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 15,
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          lineWidth: 1.75,
          color: 'rgba(17, 24, 39, 0.12)',
        },
      },
    },
  };

  return (
    <Box className="w-full h-[380px]">
      <Line data={data} options={options} />
    </Box>
  );
}
