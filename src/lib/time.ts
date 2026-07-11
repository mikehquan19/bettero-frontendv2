import dayjs from 'dayjs';

export function getThisMonthDates() {
  return [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ];
}

export function getLastMonthDates() {
  const prevStart = dayjs().startOf('month').subtract(1, 'month');
  const prevEnd = prevStart.endOf('month');
  return [prevStart.format('YYYY-MM-DD'), prevEnd.format('YYYY-MM-DD')];
}
