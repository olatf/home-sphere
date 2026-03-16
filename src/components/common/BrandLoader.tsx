import { cn } from '@/lib/utils';
export const BrandLoader = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      <div
        className={cn(
          'bg-brand h-3 w-3 animate-bounce rounded-full [animation-delay:-0.3s]'
        )}
      />
      <div
        className={cn(
          'bg-brand h-3 w-3 animate-bounce rounded-full [animation-delay:-0.15s]'
        )}
      />
      <div className={cn('bg-brand h-3 w-3 animate-bounce rounded-full')} />
    </div>
  );
};
