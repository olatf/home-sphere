import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OverviewStatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition',
        onClick && 'cursor-pointer hover:border-gray-200 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {onClick && (
          <ArrowUpRight className="h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
        )}
      </div>
      <p className="mt-4 font-bold font-primary text-2xl text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 font-secondary text-gray-500 text-sm">{label}</p>
      {sub && (
        <p className="mt-1 font-secondary text-gray-400 text-xs">{sub}</p>
      )}
    </button>
  );
};
