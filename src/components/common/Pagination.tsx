import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandButton } from '@/components/common/BrandButton';
import { cn } from '@/lib/utils';

type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  pages.push(1, 2, 3);

  if (page > 4) {
    pages.push('...');
  }

  for (
    let i = Math.max(4, page - 1);
    i <= Math.min(totalPages - 3, page + 1);
    i++
  ) {
    pages.push(i);
  }

  if (page < totalPages - 3) {
    pages.push('...');
  }

  pages.push(totalPages - 2, totalPages - 1, totalPages);

  const seen = new Set<number>();
  return pages.filter(p => {
    if (p === '...') return true;
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between border-[#EAECF0] border-t pt-4">
      <BrandButton
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1 || disabled}
        className="cursor-pointer font-semibold text-brand-black text-sm transition-colors hover:text-[#0C1B20] disabled:pointer-events-none disabled:opacity-40"
        leftIcon={<ArrowLeft className="size-5" />}
      >
        Previous
      </BrandButton>

      <div className="flex items-center gap-1">
        {pages.map(p =>
          p === '...' ? (
            <span
              key={p}
              className="flex size-10 items-center justify-center text-[#667085] text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              className={cn(
                'flex size-10 cursor-pointer items-center justify-center rounded-lg font-bold text-sm transition-colors',
                p === page
                  ? 'bg-[#F9FAFB] text-[#1D2939]'
                  : 'text-[#667085] hover:bg-[#F9FAFB] hover:text-[#1D2939]',
                disabled && 'pointer-events-none opacity-40'
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <BrandButton
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages || disabled}
        className="cursor-pointer font-semibold text-brand-black text-sm transition-colors hover:text-[#0C1B20] disabled:pointer-events-none disabled:opacity-40"
        rightIcon={<ArrowRight className="size-5" />}
      >
        Next
      </BrandButton>
    </div>
  );
}
