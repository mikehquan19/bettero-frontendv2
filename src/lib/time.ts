export function getThisMonthDates() {
  const date = new Date();
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  return [firstDate, lastDate];
}
