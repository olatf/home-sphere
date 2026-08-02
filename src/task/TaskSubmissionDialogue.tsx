'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { BrandModal } from '@/components/common/BrandModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { baseClass } from '@/config/constants';
import type { ChecklistItem } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';
import type { TaskRow } from './MyTasks';

interface TaskSubmissionDialogueProps {
  t: TaskRow;
  showReview: boolean;
  setShowReview: (v: boolean) => void;
  reviewNote: string;
  setReviewNote: (v: string) => void;
  statusPending: boolean;
  hasChecklist: boolean;
  checklist: ChecklistItem[];
  onStatusUpdate: (
    id: string,
    status: 'in_progress' | 'cancelled' | 'in_review',
    notes?: string
  ) => void;
}

export const TaskSubmissionDialogue = ({
  t,
  showReview,
  setShowReview,
  reviewNote,
  setReviewNote,
  statusPending,
  hasChecklist,
  checklist,
  onStatusUpdate,
}: TaskSubmissionDialogueProps) => {
  function handleClose() {
    setShowReview(false);
    setReviewNote('');
  }

  function handleSubmit() {
    onStatusUpdate(t.id, 'in_review', reviewNote.trim());
    handleClose();
  }

  return (
    <BrandModal
      isOpen={showReview}
      onClose={o => !o && handleClose()}
      title="Submit for Review"
      className="max-w-sm"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-brand hover:bg-brand-dark"
            disabled={statusPending || !reviewNote.trim()}
            onClick={handleSubmit}
          >
            {statusPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {hasChecklist && (
          <div className="mt-3 rounded-xl border bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              All {checklist.length} checklist items completed
            </div>
          </div>
        )}

        <p className="font-secondary text-gray-600 text-sm">
          Describe what you&apos;ve done. The reviewer will read this before
          marking the task as complete.
        </p>

        <Textarea
          placeholder="e.g. Completed the plumbing inspection. Found a minor leak and sealed it. Tenant has been informed."
          className={cn('min-h-28 resize-none font-secondary', baseClass)}
          value={reviewNote}
          onChange={e => setReviewNote(e.target.value)}
        />

        {!reviewNote.trim() && (
          <p className="font-secondary text-amber-600 text-xs">
            A note is required.
          </p>
        )}
      </div>
    </BrandModal>
  );
};
