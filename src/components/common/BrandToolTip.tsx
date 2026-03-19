import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleHelp, ShieldAlert } from 'lucide-react';

interface BrandToolTipProps {
  content: string;
  children?: React.ReactNode;
}

export const BrandToolTip = ({ content, children }: BrandToolTipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        className="flex items-center justify-center"
        asChild={!!children}
      >
        {children ?? <CircleHelp className="h-4 w-4 text-emerald-600" />}
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface BrandToastProps {
  show: boolean;
  content: string;
}

export const BrandToast = ({ show, content }: BrandToastProps) => {
  if (!show) return null;
  return (
    <div className="animate-in fade-in slide-in-from-top-2 mx-7 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm duration-200">
      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
      <span>{content}</span>
    </div>
  );
};
