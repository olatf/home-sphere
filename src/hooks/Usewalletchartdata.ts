import { useQuery } from '@tanstack/react-query';

export interface MonthlyDataPoint {
  month: string;
  total_credit: number;
  total_debit: number;
  deposits: number;
  withdrawals: number;
  rent_payments: number;
  inspection_payments: number;
  purchase_payments: number;
  transfers_out: number;
  transfers_in: number;
  transaction_count: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ChartTotals {
  deposits: number;
  withdrawals: number;
  rent_payments: number;
  inspection_payments: number;
  landlord_payouts: number;
  admin_transfers_in: number;
  admin_transfers_out: number;
  purchase_payments: number;
  transfers_out: number;
  transfers_in: number;
}

interface ChartData {
  monthly: MonthlyDataPoint[];
  pie: PieDataPoint[];
  totals: ChartTotals;
}

async function fetchChartData(months: number): Promise<ChartData> {
  const res = await fetch(`/api/wallet/chart-data?months=${months}`);
  if (!res.ok) throw new Error('Failed to fetch chart data');
  return res.json();
}

export function useWalletChartData(months: 3 | 6 | 12 = 6) {
  const { data, error, isLoading, refetch } = useQuery<ChartData>({
    queryKey: ['wallet-chart-data', months],
    queryFn: () => fetchChartData(months),
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });

  return {
    monthly: data?.monthly ?? [],
    pie: data?.pie ?? [],
    totals: data?.totals,
    isLoading,
    error,
    refetch,
  };
}
