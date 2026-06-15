'use client';

import ExpenseDaily from '@components/charts/ExpenseDaily';
import ExpenseChange from '@components/charts/ExpenseChange';
import ExpenseComposition from '@components/charts/ExpenseComposition';
import TransactionTable from '@components/transactions/TransactionTable';
import { AnalysisInfo, PaginatedData, Transaction } from '@interface';
import { BASE_URL, PageLimit } from '@constant';
import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState, MouseEvent, useMemo } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';

type Period = {
  startDate: string;
  endDate: string;
};

function periodEqual(a: Period, b: Period): boolean {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}

type PeriodType = 'MONTH' | 'BIWEEK' | 'WEEK';

type PeriodTranFetchKey = {
  selectedType: PeriodType;
  selectedPeriod: Period | null;
  category: string | null;
  offset: number;
};

export default function Summary() {
  const [tranFetchKey, setTranFetchKey] = useState<PeriodTranFetchKey>({
    selectedType: 'MONTH',
    selectedPeriod: null,
    category: null,
    offset: 0,
  });

  // Recalculate the list of periods only when selectedType changes
  const selectedTypePeriods = useMemo(() => {
    // Get the current month, biweek, and week
    function getCurrentPeriod(type: PeriodType): [dayjs.Dayjs, dayjs.Dayjs] {
      switch (type) {
        case 'MONTH':
          return [dayjs().startOf('month'), dayjs().endOf('month')];
        case 'BIWEEK':
          const end = dayjs().endOf('week');
          return [end.subtract(13, 'day'), end];
        case 'WEEK':
          return [dayjs().startOf('week'), dayjs().endOf('week')];
      }
    }

    // Get the previous period from the given period
    function getPreviousPeriod(
      type: PeriodType,
      period: [dayjs.Dayjs, dayjs.Dayjs],
    ): [dayjs.Dayjs, dayjs.Dayjs] {
      let start: dayjs.Dayjs;
      switch (type) {
        case 'MONTH':
          start = period[0].subtract(1, 'month');
          return [start, start.endOf('month')];
        case 'BIWEEK':
          return [period[0].subtract(14, 'day'), period[1].subtract(14, 'day')];
        case 'WEEK':
          start = period[0].subtract(1, 'week');
          return [start, start.endOf('week')];
      }
    }

    const _selectedTypePeriods: Period[] = [];
    let [start, end] = getCurrentPeriod(tranFetchKey.selectedType);

    const startSixMonthsAgo = dayjs().subtract(6, 'month').startOf('month');
    while (start.isAfter(startSixMonthsAgo)) {
      _selectedTypePeriods.push({
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      });

      [start, end] = getPreviousPeriod(tranFetchKey.selectedType, [start, end]);
    }

    return _selectedTypePeriods;
  }, [tranFetchKey.selectedType]);

  function handleChangePeriodType(
    event: MouseEvent<HTMLElement>,
    newPeriodType: PeriodType | null,
  ) {
    // If user clicks on type twice, they effectively deselect the option, and selectedType is null
    // this is avoid that
    const forceType = newPeriodType ?? tranFetchKey.selectedType;
    if (tranFetchKey.selectedType !== forceType) {
      setTranFetchKey((prevKey) => ({
        ...prevKey,
        selectedType: forceType,
        // Fetch all categories
        category: null,
        // Coalese it to the first value of the list of newly changed periods
        selectedPeriod: null,
        // Move back to the first page
        offset: 0,
      }));
    }
  }

  function handleChangePeriod(period: Period) {
    if (
      !tranFetchKey.selectedPeriod ||
      !periodEqual(period, tranFetchKey.selectedPeriod)
    ) {
      setTranFetchKey((prevKey) => ({
        ...prevKey,
        category: null,
        selectedPeriod: period,
        offset: 0,
      }));
    }
  }

  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    const newOffset = page * PageLimit;
    setTranFetchKey((prev) => ({ ...prev, offset: newOffset }));
  }

  /**
   * To make the date format more readable to user
   */
  function getPeriodDisplay(period: Period): string {
    const start = dayjs(period.startDate);
    const end = dayjs(period.endDate);

    if (start.year() === end.year()) {
      if (start.month() === end.month()) {
        return `${start.format('YYYY')}, ${start.format('MMM D')} - ${end.format('D')}`;
      } else {
        return `${start.format('YYYY')}, ${start.format('MMM D')} - ${end.format('MMM D')}`;
      }
    }
    return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
  }

  /**
   * The title uses the state of the transaction fetch key, which should be
   * consistent with the fetching behavior
   */
  function getTranTableTitle(): string {
    // Pick the first period from the list of periods if the selectedTypePeriods is not defined
    const startDate = tranFetchKey.selectedPeriod
      ? tranFetchKey.selectedPeriod.startDate
      : selectedTypePeriods[0].startDate;
    const endDate = tranFetchKey.selectedPeriod
      ? tranFetchKey.selectedPeriod.endDate
      : selectedTypePeriods[0].endDate;

    const periodDisplay = getPeriodDisplay({ startDate, endDate } as Period);

    const category = (tranFetchKey.category ?? '').toLocaleLowerCase();
    return `List of ${category} transactions ${periodDisplay}`;
  }

  async function fetchPeriodAnalysis(key: {
    type: string;
    period: Period;
  }): Promise<AnalysisInfo> {
    const startDate = key.period.startDate;
    const endDate = key.period.endDate;
    const periodSummaryUrl = `${BASE_URL}/summary?interval_type=${key.type}&start=${startDate}&end=${endDate}`;
    const res = await fetch(periodSummaryUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }
    return {
      basic: resData.data.basic ?? {},
      daily: resData.data.daily ?? {},
      change: resData.data.change ?? {},
      composition: resData.data.composition ?? {},
    } as AnalysisInfo;
  }

  async function fetchPeriodTransactions(
    key: PeriodTranFetchKey,
  ): Promise<PaginatedData<Transaction[]>> {
    const startDate = tranFetchKey.selectedPeriod
      ? tranFetchKey.selectedPeriod.startDate
      : selectedTypePeriods[0].startDate;
    const endDate = tranFetchKey.selectedPeriod
      ? tranFetchKey.selectedPeriod.endDate
      : selectedTypePeriods[0].endDate;

    let periodTranUrl = `${BASE_URL}/transactions?start=${startDate}&end=${endDate}&offset=${key.offset}`;
    if (key.category) {
      periodTranUrl += `&category=${key.category}`;
    }
    const res = await fetch(periodTranUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const resData = await res.json();
    if (resData.error !== '') {
      throw new Error(resData.error);
    }
    return {
      total: resData.data.total ?? 0,
      offset: resData.data.offset ?? 0,
      data: resData.data.data ?? [],
    } as PaginatedData<Transaction[]>;
  }

  // TODO: When things are going well, we will start caching
  const { data: analysisData } = useSWR(
    {
      type: tranFetchKey.selectedType,
      period: tranFetchKey.selectedPeriod ?? selectedTypePeriods[0],
    },
    fetchPeriodAnalysis,
    {
      keepPreviousData: true,
      dedupingInterval: 0, // Disables the short-term memory cache
      revalidateIfStale: false, // Stops re-fetching when using stale cache
      revalidateOnFocus: false, // Stops refetching when window is focused
    },
  );
  const dailyData = analysisData?.daily;
  const changeData = analysisData?.change;
  const compositionData = analysisData?.composition;

  const { data: transactionsData } = useSWR(
    tranFetchKey,
    fetchPeriodTransactions,
    {
      keepPreviousData: true,
      dedupingInterval: 0,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  return (
    <>
      <Typography variant="h5" className="font-bold text-gray-500">
        Detailed analysis for the past 6 months
      </Typography>
      <ToggleButtonGroup
        className="mt-8 flex justify-center"
        value={tranFetchKey.selectedType}
        exclusive
        aria-label="Analysis period"
        onChange={handleChangePeriodType}
      >
        {['MONTH', 'BIWEEK', 'WEEK'].map((periodType) => (
          <ToggleButton
            key={periodType}
            value={periodType}
            aria-label={periodType}
          >
            {periodType}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Stack
        direction="row"
        spacing={1}
        className="p-2 mt-8 rounded-xl shadow-xl overflow-x-auto"
      >
        {selectedTypePeriods.map((period, idx) => (
          <Button
            key={idx}
            variant="contained"
            color={
              periodEqual(
                period,
                tranFetchKey.selectedPeriod ?? selectedTypePeriods[0],
              )
                ? 'success'
                : 'primary'
            }
            className="p-1 rounded-lg min-h-16 min-w-50 text-lg font-semibold flex normal-case"
            onClick={() => handleChangePeriod(period)}
          >
            {getPeriodDisplay(period)}
          </Button>
        ))}
      </Stack>
      {/* 
        analysisData & transactionsData fetching is separate since they are separately rendered
      */}
      {Boolean(analysisData) && (
        <Stack
          spacing={6}
          className="my-4 bg-blue-300 rounded-xl shadow-lg p-4"
        >
          <ExpenseDaily
            periodType={tranFetchKey.selectedType.toLocaleLowerCase()}
            dailyExpenses={dailyData!}
          />
          <Stack direction="row" className="justify-evenly">
            <ExpenseChange
              periodType={tranFetchKey.selectedType.toLocaleLowerCase()}
              percentages={changeData!}
            />
            <ExpenseComposition
              periodType={tranFetchKey.selectedType.toLocaleLowerCase()}
              percentages={compositionData!}
              onChangeCategory={(category) => {
                if (category !== tranFetchKey.category) {
                  setTranFetchKey((prev) => ({ ...prev, category, offset: 0 }));
                }
              }}
            />
          </Stack>
        </Stack>
      )}
      {Boolean(transactionsData) && (
        <TransactionTable
          title={getTranTableTitle()}
          paginatedTransactions={transactionsData!}
          onPageChange={handlePageChange}
        />
      )}
      <Stack direction="row" className="justify-center mt-4">
        <Button
          className="bg-gray-400 font-bold rounded-lg flex"
          variant="contained"
          onClick={() => {
            if (tranFetchKey.category !== null) {
              setTranFetchKey((prev) => ({
                ...prev,
                category: null,
                offset: 0,
              }));
            }
          }}
        >
          Back To Latest
        </Button>
      </Stack>
    </>
  );
}
