import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleQuestionMark } from 'lucide-react';

export const BrandToolTip = ({ content }: { content: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center justify-center">
        <CircleQuestionMark className="text-brand h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};
