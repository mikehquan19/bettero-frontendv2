import { Skeleton, Box, Stack } from '@mui/material';

function LoadingChart(props: { height: number }) {
  return (
    <div className="w-full bg-blue-300">
      <Skeleton className="mx-auto" variant="text" width={350} height={50} />

      <Box sx={{ height: props.height - 50 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          className="rounded-lg"
        />
      </Box>
    </div>
  );
}

export default function LoadingChartPanel() {
  return (
    <Stack spacing={6} className="my-4 bg-blue-300 rounded-xl shadow-lg p-4">
      <LoadingChart height={380} />
      <Stack direction="row" spacing={4} className="justify-evenly">
        <LoadingChart height={420} />
        <LoadingChart height={420} />
      </Stack>
    </Stack>
  );
}
