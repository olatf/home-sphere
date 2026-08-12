'use client';

import {
  BarChart2,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useWalletChartData } from '@/hooks/Usewalletchartdata';
import { cn } from '@/lib/utils';

type ChartView = 'bar' | 'pie';
type MonthRange = 3 | 6 | 12;

interface TooltipPayloadItem {
  name: string;
  value: number;
  dataKey?: string;
  payload: unknown;
  color: string;
  fill?: string;
}

const CREDIT_BARS = [
  { key: 'deposits', name: 'Deposits', color: '#059669' },
  { key: 'transfers_in', name: 'Transfers In', color: '#10b981' },
  { key: 'landlord_payouts', name: 'Landlord Payouts', color: '#34d399' },
  { key: 'admin_transfers_in', name: 'Admin Credits', color: '#6ee7b7' },
];

const DEBIT_BARS = [
  { key: 'withdrawals', name: 'Withdrawals', color: '#f43f5e' },
  { key: 'rent_payments', name: 'Rent', color: '#1b5e40' },
  { key: 'inspection_payments', name: 'Inspections', color: '#f59e0b' },
  { key: 'purchase_payments', name: 'Purchases', color: '#3b82f6' },
  { key: 'transfers_out', name: 'Transfers Out', color: '#8b5cf6' },
  { key: 'admin_transfers_out', name: 'Admin Debits', color: '#c084fc' },
];

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const credits = payload.filter(
    (p: TooltipPayloadItem) =>
      CREDIT_BARS.some(b => b.key === p.name) && p.value > 0
  );
  const debits = payload.filter(
    (p: TooltipPayloadItem) =>
      DEBIT_BARS.some(b => b.key === p.name) && p.value > 0
  );

  return (
    <div className="min-w-44 rounded-xl border bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-primary font-semibold text-gray-800">{label}</p>

      {credits.length > 0 && (
        <div className="mb-2">
          <p
            className="mb-1 font-secondary font-semibold text-emerald-600 uppercase tracking-wide"
            style={{ fontSize: 10 }}
          >
            Money In
          </p>
          {credits.map(p => (
            <div
              key={p.dataKey}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: p.fill }}
                />
                <span className="text-gray-600">{p.name}</span>
              </div>
              <span className="font-medium text-gray-800">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {debits.length > 0 && (
        <div>
          <p
            className="mb-1 font-secondary font-semibold text-red-500 uppercase tracking-wide"
            style={{ fontSize: 10 }}
          >
            Money Out
          </p>
          {debits.map((p: TooltipPayloadItem) => (
            <div
              key={p.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-gray-600">{p.name}</span>
              </div>
              <span className="font-medium text-gray-800">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border bg-white p-3 text-xs shadow-lg">
      <div className="mb-1 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: entry.color }}
        />
        <span className="font-primary font-semibold text-gray-800">
          {entry.name}
        </span>
      </div>
      <p className="font-secondary text-gray-600">
        {formatCurrency(entry.value)}
      </p>
      <p className="font-secondary text-gray-400">{entry.value}% of total</p>
    </div>
  );
}

const SKELETON_HEIGHTS = [55, 80, 40, 90, 65, 75];

function ChartSkeleton() {
  return (
    <div className="space-y-3 py-4">
      <div className="flex h-48 items-end gap-3 px-2">
        {SKELETON_HEIGHTS.map(h => (
          <div
            key={h}
            className="flex-1 animate-pulse rounded-t-lg bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-4">
        {[0, 1].map(i => (
          <div
            key={i}
            className="h-3 w-10 animate-pulse rounded bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  trend,
}: {
  label: string;
  value: number;
  trend: 'up' | 'down';
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-gray-50 px-2 py-3 font-secondary md:px-4">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-bold text-gray-800 text-sm">{formatCurrency(value)}</p>
      <div
        className={`flex items-center gap-1 font-medium text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}
      >
        {trend === 'up' ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {trend === 'up' ? 'Money in' : 'Money out'}
      </div>
    </div>
  );
}

type pieDataPoint = {
  name: string;
  value: number;
  color: string;
  group: 'in' | 'out';
};
function PieLegend({ data }: { data: pieDataPoint[] }) {
  const totalValue = data.reduce((s, d) => s + d.value, 0);
  const withPct = data.map(d => ({
    ...d,
    percent: totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : '0',
  }));

  const credits = withPct.filter(d => d.group === 'in');
  const debits = withPct.filter(d => d.group === 'out');

  return (
    <div className="mt-4 grid w-full grid-cols-2 gap-4 text-xs">
      {[
        { label: 'Money In', items: credits, accent: 'text-emerald-600' },
        { label: 'Money Out', items: debits, accent: 'text-red-500' },
      ].map(group => (
        <div key={group.label}>
          <p
            className={cn(
              'mb-2 font-secondary font-semibold uppercase tracking-wide',
              group.accent
            )}
            style={{ fontSize: 10 }}
          >
            {group.label}
          </p>
          <div className="space-y-1.5">
            {group.items.map(item => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="truncate text-gray-600">{item.name}</span>
                </div>
                <span className="shrink-0 font-medium text-gray-500">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MonthlyDataPoint {
  month: string;
  [key: string]: string | number;
}

export function SummaryChart() {
  const [view, setView] = useState<ChartView>('bar');
  const [months, setMonths] = useState<MonthRange>(6);
  // const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const { monthly, pie, totals, isLoading } = useWalletChartData(months);

  const totalIn =
    (totals?.deposits ?? 0) +
    (totals?.transfers_in ?? 0) +
    (totals?.landlord_payouts ?? 0) +
    (totals?.admin_transfers_in ?? 0);

  const totalOut =
    (totals?.withdrawals ?? 0) +
    (totals?.rent_payments ?? 0) +
    (totals?.inspection_payments ?? 0) +
    (totals?.purchase_payments ?? 0) +
    (totals?.transfers_out ?? 0) +
    (totals?.admin_transfers_out ?? 0);

  const monthlyData = monthly as unknown as MonthlyDataPoint[];

  const activeCredits = CREDIT_BARS.filter(b =>
    monthlyData.some(m => (m[b.key] as number) > 0)
  );

  const activeDebits = DEBIT_BARS.filter(b =>
    monthlyData.some(m => (m[b.key] as number) > 0)
  );

  const hasData = monthly.length > 0;

  if (isLoading)
    return (
      <div className="mx-7 mt-3 rounded-2xl border bg-white p-6 shadow-sm">
        <ChartSkeleton />
      </div>
    );

  return (
    <div className="mx-2 mt-3 rounded-2xl border bg-white p-3 shadow-sm md:mx-7 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Transaction Overview</h3>
          <p className="mt-0.5 text-gray-400 text-xs">
            Last {months} months of activity
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-items-start">
          <div className="flex overflow-hidden rounded-lg border border-gray-100">
            {([3, 6, 12] as MonthRange[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`px-3 py-1.5 font-medium text-xs transition ${months === m ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {m}M
              </button>
            ))}
          </div>
          <div className="flex justify-end overflow-hidden rounded-lg border border-gray-100 md:justify-items-start">
            <button
              type="button"
              onClick={() => setView('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition ${view === 'bar' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BarChart2 className="h-3.5 w-3.5" /> Bar
            </button>
            <button
              type="button"
              onClick={() => setView('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition ${view === 'pie' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <PieIcon className="h-3.5 w-3.5" /> Pie
            </button>
          </div>
        </div>
      </div>

      {/* Summary pills */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatPill label="Total In" value={totalIn} trend="up" />
        <StatPill label="Total Out" value={totalOut} trend="down" />
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <BarChart2 className="h-10 w-10 text-gray-200" />
          <p className="font-medium text-gray-400 text-sm">
            No transaction data yet
          </p>
          <p className="text-gray-300 text-xs">
            Complete a transaction to see your overview.
          </p>
        </div>
      ) : view === 'bar' ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={monthly}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`
              }
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: '#f9fafb' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
              formatter={(value: string) =>
                value
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
              }
            />
            {/* Money in */}
            {activeCredits.map(b => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={b.color}
                radius={[4, 4, 0, 0]}
                stackId="credit"
                barSize={100}
              />
            ))}
            {activeDebits.map(b => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={b.color}
                radius={[4, 4, 0, 0]}
                stackId="debit"
                barSize={100}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pie}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
                stroke="none"
              >
                {pie.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={pie as pieDataPoint[]} />
        </div>
      )}
    </div>
  );
}
