'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays, format, isPast, isToday } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListChecks,
  Loader2,
  MoreVertical,
  Send,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandModal } from '@/components/common/BrandModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { capitalizeWords } from '@/helpers/formatters.helpers';
import type { useForwardTask } from '@/hooks/useTask';
import type { ForwardTaskFormData } from '@/lib/schemas/property';
import { forwardTaskSchema } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';
import { TaskChecklist } from './CheckList';
import type { TaskRow } from './MyTasks';
import { PRIORITY_CONFIG, STATUS_CONFIG } from './MyTasks';
import { TaskSubmissionDialogue } from './TaskSubmissionDialogue';

interface TaskCardProps {
  task: TaskRow;
  currentUserId?: string;
  statusPending: boolean;
  onStatusUpdate: (
    id: string,
    status: 'in_progress' | 'in_review' | 'cancelled',
    notes?: string
  ) => void;

  availableUsers?: { id: string; full_name: string; role: string }[];
  forwardMutation?: ReturnType<typeof useForwardTask>;
}

export const TaskCard = ({
  task: t,
  currentUserId,
  statusPending,
  onStatusUpdate,
  availableUsers,
  forwardMutation,
}: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.pending;
  const priCfg = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.medium;
  const StatusIcon = cfg.icon;

  const isDone = t.status === 'completed' || t.status === 'cancelled';
  const isInReview = t.status === 'in_review';
  const canStart = t.status === 'pending';
  const canSubmit = t.status === 'in_progress';
  const isAssignee = t.assigned_to === currentUserId;
  const canAct = isAssignee && !isDone;
  // Forwarding requires the optional props to be present
  const canForward = canAct && !!availableUsers?.length && !!forwardMutation;

  const canMarkAsDone = t.assigned_by === currentUserId && !isDone;

  const checklist = t.checklist ?? [];
  const hasChecklist = checklist.length > 0;
  const allItemsDone = !hasChecklist || checklist.every(i => i.done);
  const doneCount = checklist.filter(i => i.done).length;

  const isDue = t.due_date ? isPast(new Date(t.due_date)) : false;
  const isToday_ = t.due_date ? isToday(new Date(t.due_date)) : false;
  const daysLeft = t.due_date
    ? differenceInDays(new Date(t.due_date), new Date())
    : null;
  const overdueAndActive = isDue && !isDone && !isInReview;

  function dueDateLabel() {
    if (!t.due_date) return null;
    if (overdueAndActive)
      return `Overdue · was due ${format(new Date(t.due_date), 'MMM d')}`;
    if (isToday_) return 'Due today';
    if (daysLeft !== null && daysLeft > 0 && daysLeft <= 3)
      return `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    return `Due ${format(new Date(t.due_date), 'MMM d, yyyy')}`;
  }

  const forwardForm = useForm<
    ForwardTaskFormData,
    unknown,
    ForwardTaskFormData
  >({
    resolver: zodResolver(forwardTaskSchema),
    defaultValues: { task_id: t.id, forward_to: '', reason: '' },
  });

  async function handleForward(data: ForwardTaskFormData) {
    if (!forwardMutation) return;
    const r = await forwardMutation.mutateAsync(data);
    if (r.success) {
      toast.success('Task forwarded');
      setShowForward(false);
      forwardForm.reset();
    } else {
      toast.error(r.error ?? 'Failed to forward task');
    }
  }

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-white transition hover:shadow-sm',
          cfg.cardBorder
        )}
      >
        {/* Header row */}
        {/* biome-ignore lint/a11y/useSemanticElements: can't use a native <button> here, it wraps a nested interactive dropdown menu */}
        <div
          className="flex cursor-pointer items-start gap-4 p-4"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => setExpanded(v => !v)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(v => !v);
            }
          }}
        >
          {/* Status icon */}
          <div
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              cfg.badge
            )}
          >
            <StatusIcon className="h-4 w-4" />
          </div>

          {/* Title + meta */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-primary font-semibold text-gray-800">
                {t.title}
              </p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide',
                  priCfg.className
                )}
              >
                {priCfg.label}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-medium text-xs',
                  cfg.badge
                )}
              >
                {cfg.label}
              </span>
              {hasChecklist && (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs',
                    allItemsDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <ListChecks className="h-3 w-3" />
                  {doneCount}/{checklist.length}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs">
              {t.reference_table && (
                <span className="font-secondary text-gray-500">
                  {capitalizeWords(t.reference_table)}
                </span>
              )}
              {t.user_profiles && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  From {t.user_profiles.full_name}
                </span>
              )}
              {t.due_date && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    overdueAndActive
                      ? 'font-semibold text-red-500'
                      : isToday_
                        ? 'font-semibold text-amber-600'
                        : daysLeft !== null && daysLeft > 0 && daysLeft <= 3
                          ? 'text-amber-500'
                          : ''
                  )}
                >
                  <CalendarClock className="h-3 w-3" />
                  {dueDateLabel()}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {canAct && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={e => e.stopPropagation()}
                    className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {canStart && (
                    <DropdownMenuItem
                      disabled={statusPending}
                      onClick={() => onStatusUpdate(t.id, 'in_progress')}
                    >
                      <Clock className="mr-2 h-3.5 w-3.5" /> Start Working
                    </DropdownMenuItem>
                  )}
                  {canSubmit && (
                    <DropdownMenuItem
                      disabled={!allItemsDone}
                      onClick={() => setShowReview(true)}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" /> Submit for Review
                    </DropdownMenuItem>
                  )}
                  {canForward && (
                    <DropdownMenuItem onClick={() => setShowForward(true)}>
                      <ArrowRight className="mr-2 h-3.5 w-3.5" /> Forward Task
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    disabled={statusPending}
                    className="text-red-500 focus:text-red-500"
                    onClick={() => onStatusUpdate(t.id, 'cancelled')}
                  >
                    <AlertCircle className="mr-2 h-3.5 w-3.5" /> Cancel Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <BrandButton
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </BrandButton>
          </div>
        </div>

        {expanded && (
          <div className="space-y-4 border-t bg-gray-50/60 px-5 py-4">
            {/* Description */}
            <div>
              <p className="mb-1.5 font-secondary font-semibold text-gray-400 text-xs uppercase tracking-wide">
                Task Details
              </p>
              <p className="whitespace-pre-wrap font-secondary text-gray-700 text-sm leading-relaxed">
                {t.description}
              </p>
            </div>

            {t.notes && (
              <div>
                <p className="mb-1.5 font-secondary font-semibold text-gray-400 text-xs uppercase tracking-wide">
                  Notes from Assigner
                </p>
                <div className="rounded-lg border bg-white p-3 font-secondary text-gray-600 text-sm">
                  {t.notes}
                </div>
              </div>
            )}

            {hasChecklist && (
              <div>
                <p className="mb-2 font-secondary font-semibold text-gray-400 text-xs uppercase tracking-wide">
                  Checklist
                </p>
                <div className="rounded-xl border bg-white p-3">
                  <TaskChecklist
                    taskId={t.id}
                    items={checklist}
                    disabled={isDone || isInReview || !isAssignee}
                  />
                </div>
              </div>
            )}

            {t.review_note && (
              <div>
                <p className="mb-1.5 font-secondary font-semibold text-gray-400 text-xs uppercase tracking-wide">
                  Your Submission Note
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 font-secondary text-amber-800 text-sm">
                  {t.review_note}
                </div>
              </div>
            )}

            {isInReview && isAssignee && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Send className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="font-secondary text-amber-700 text-sm">
                  Submitted for review. Waiting for the reviewer to mark this
                  task as complete.
                </p>
              </div>
            )}

            {t.completed_at && !isInReview && (
              <p className="flex items-center gap-1.5 font-secondary text-emerald-600 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Marked complete on{' '}
                {format(new Date(t.completed_at), 'MMM d, yyyy · h:mm a')}
              </p>
            )}

            <p className="font-secondary text-gray-400 text-xs">
              Assigned on {format(new Date(t.created_at), 'MMM d, yyyy')}
            </p>

            {!isDone && !isInReview && isAssignee && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                {canStart && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusPending}
                    onClick={() => onStatusUpdate(t.id, 'in_progress')}
                  >
                    {statusPending ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-3.5 w-3.5" />
                    )}
                    Start Working
                  </Button>
                )}

                {canSubmit && (
                  <Button
                    size="sm"
                    className="bg-brand hover:bg-brand-dark"
                    disabled={!allItemsDone || statusPending}
                    title={
                      !allItemsDone
                        ? 'Complete all checklist items first'
                        : undefined
                    }
                    onClick={() => {
                      setShowReview(true);
                    }}
                  >
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Submit for Review
                    {hasChecklist && !allItemsDone && (
                      <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                        {doneCount}/{checklist.length}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            )}

            {canMarkAsDone && <Button>Mark as Complete</Button>}
          </div>
        )}

        {/* Overdue banner */}
        {overdueAndActive && isAssignee && (
          <div className="flex items-center gap-2 bg-red-50 px-5 py-2.5 text-red-600 text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            This task is overdue — please action it as soon as possible.
          </div>
        )}
      </div>

      <TaskSubmissionDialogue
        t={t}
        showReview={showReview}
        setShowReview={setShowReview}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        statusPending={statusPending}
        hasChecklist={hasChecklist}
        checklist={checklist}
        onStatusUpdate={onStatusUpdate}
      />

      {canForward && (
        <BrandModal
          isOpen={showForward}
          onClose={o => {
            if (!o) {
              setShowForward(false);
              forwardForm.reset();
            }
          }}
          title="Forward Task"
          description="Reassign this task to another team member with a reason."
          footer={
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowForward(false);
                  forwardForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-brand hover:bg-brand-dark"
                disabled={forwardMutation!.isPending}
                onClick={forwardForm.handleSubmit(handleForward)}
              >
                {forwardMutation!.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Forward
              </Button>
            </div>
          }
        >
          <Form {...forwardForm}>
            <div className="space-y-4">
              <FormField
                control={forwardForm.control}
                name="forward_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forward to</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUsers!
                          .filter(u => u.id !== currentUserId)
                          .map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.full_name}{' '}
                              <span className="text-gray-400 capitalize">
                                ({u.role})
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={forwardForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-none"
                        placeholder="Why are you forwarding this task?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </BrandModal>
      )}
    </>
  );
};
