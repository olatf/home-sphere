import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateTaskChecklist } from '@/hooks/useTask';
import type { ChecklistItem } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';

export const TaskChecklist = ({
  taskId,
  items,
  disabled,
}: {
  taskId: string;
  items: ChecklistItem[];
  disabled: boolean;
}) => {
  const checklistMutation = useUpdateTaskChecklist();
  const doneCount = items.filter(i => i.done).length;
  const totalCount = items.length;
  const allDone = doneCount === totalCount;

  async function toggleItem(itemId: string) {
    if (disabled) return;
    const updated = items.map(i =>
      i.id === itemId ? { ...i, done: !i.done } : i
    );
    const r = await checklistMutation.mutateAsync({
      taskId,
      checklist: updated,
    });
    if (!r.success) toast.error(r.error ?? 'Failed to update checklist');
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              allDone ? 'bg-emerald-500' : 'bg-brand'
            )}
            style={{
              width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
        <span
          className={cn(
            'shrink-0 font-medium font-secondary text-xs',
            allDone ? 'text-emerald-600' : 'text-gray-500'
          )}
        >
          {doneCount}/{totalCount}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition',
              disabled ? 'cursor-default opacity-60' : 'hover:bg-gray-50',
              item.done && 'opacity-70'
            )}
          >
            <Checkbox
              checked={item.done}
              disabled={disabled || checklistMutation.isPending}
              onCheckedChange={() => toggleItem(item.id)}
              className={cn('shrink-0', disabled && 'border-brand/30')}
            />
            <span
              className={cn(
                'font-secondary text-sm',
                item.done ? 'text-gray-400 line-through' : 'text-gray-700'
              )}
            >
              {item.label}
            </span>
            {item.done && (
              <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" />
            )}
          </div>
        ))}
      </div>

      {!allDone && !disabled && (
        <p className="font-secondary text-amber-600 text-xs">
          Complete all checklist items before submitting for review.
        </p>
      )}
    </div>
  );
};
