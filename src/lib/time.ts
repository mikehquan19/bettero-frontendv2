import dayjs from 'dayjs';

export function getThisMonthDates() {
  return [
    dayjs().startOf('month').format('YYYY-MM-DD'), 
    dayjs().endOf('month').format('YYYY-MM-DD')
  ];
}
