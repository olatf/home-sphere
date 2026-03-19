'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { useWalletChartData } from '@/hooks/Usewalletchartdata';
import { formatCurrency } from '@/helpers/currency.helpers';

type ChartView = 'bar' | 'pie';
type MonthRange = 3 | 6 | 12;

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

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
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-gray-700">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-500 capitalize">
            {p.name.replace(/_/g, ' ')}:
          </span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

const SKELETON_HEIGHTS = [55, 80, 40, 90, 65, 75];

function ChartSkeleton() {
  return (
    <div className="space-y-3 py-4">
      <div className="flex h-48 items-end gap-3 px-2">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-lg bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-4">
        {[0, 1].map(i => (
          <div
            key={i}
            className="h-3 w-20 animate-pulse rounded bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
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
    <div className="font-secondary flex flex-col gap-0.5 rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{formatCurrency(value)}</p>
      <div
        className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}
      >
        {trend === 'up' ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {trend === 'up' ? 'Money in' : 'Money out'}
      </div>
    </div>
  );
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

function PieLegend({
  data,
  activeIndex,
  onHover,
}: {
  data: PieDataPoint[];
  activeIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {data.map((entry, index) => (
        <button
          key={entry.name}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition ${activeIndex === index ? 'bg-gray-100' : ''}`}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-xs text-gray-500">{entry.name}</span>
          <span className="text-xs font-semibold text-gray-700">
            {formatCurrency(entry.value)}
          </span>
        </button>
      ))}
    </div>
  );
}

function PieCenterLabel({
  cx,
  cy,
  entry,
}: {
  cx: number;
  cy: number;
  entry: PieDataPoint | null;
}) {
  if (!entry) return null;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#374151"
        fontSize={13}
        fontWeight={600}
      >
        {entry.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={11}>
        {formatCurrency(entry.value)}
      </text>
    </g>
  );
}

export function SummaryChart() {
  const [view, setView] = useState<ChartView>('bar');
  const [months, setMonths] = useState<MonthRange>(6);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const { monthly, pie, totals, isLoading } = useWalletChartData(months);

  const totalIn = (totals?.deposits ?? 0) + (totals?.transfers_in ?? 0);

  const totalOut =
    (totals?.withdrawals ?? 0) +
    (totals?.rent_payments ?? 0) +
    (totals?.inspection_payments ?? 0) +
    (totals?.purchase_payments ?? 0) +
    (totals?.transfers_out ?? 0);

  const hasData = monthly.length > 0 || pie.length > 0;
  const activeEntry =
    activePieIndex !== null ? (pie[activePieIndex] ?? null) : null;

  if (isLoading)
    return (
      <div className="mx-7 mt-3 rounded-2xl border bg-white p-6 shadow-sm">
        <ChartSkeleton />
      </div>
    );

  return (
    <AnimatedWrapper type="slideInUp">
      <div className="mx-7 mt-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              Transaction Overview
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Last {months} months of activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-gray-100">
              {([3, 6, 12] as MonthRange[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`px-3 py-1.5 text-xs font-medium transition ${months === m ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {m}M
                </button>
              ))}
            </div>
            <div className="flex overflow-hidden rounded-lg border border-gray-100">
              <button
                onClick={() => setView('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${view === 'bar' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <BarChart2 className="h-3.5 w-3.5" /> Bar
              </button>
              <button
                onClick={() => setView('pie')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${view === 'pie' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
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
            <p className="text-sm font-medium text-gray-400">
              No transaction data yet
            </p>
            <p className="text-xs text-gray-300">
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
              <Bar
                dataKey="deposits"
                name="deposits"
                fill="#059669"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="transfers_in"
                name="transfers_in"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              {/* Money out */}
              <Bar
                dataKey="total_debit"
                name="total_debit"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="transfers_out"
                name="transfers_out"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
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
                  {pie.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={
                        activePieIndex === null || activePieIndex === index
                          ? 1
                          : 0.4
                      }
                      onMouseEnter={() => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    />
                  ))}
                </Pie>
                {activeEntry && (
                  <PieCenterLabel cx={200} cy={130} entry={activeEntry} />
                )}
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              data={pie}
              activeIndex={activePieIndex}
              onHover={setActivePieIndex}
            />
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}
