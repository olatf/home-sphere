import { cn } from '@/lib/utils';

export type CardDetails = {
  label: string;
  value: number | string;
  bg: string;
  color: string;
};
export interface SummaryInfoCardProps {
  cardDetails: CardDetails[];
}
export const SummaryInfoCard = ({ cardDetails }: SummaryInfoCardProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cardDetails.map(s => (
        <div key={s.label} className={cn('rounded-xl px-4 py-3', s.bg)}>
          <p className={cn('font-bold font-primary text-2xl', s.color)}>
            {s.value}
          </p>
          <p className="font-secondary text-gray-500 text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  );
};
