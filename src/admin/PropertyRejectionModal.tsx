import { Loader2, XCircle } from 'lucide-react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandModal } from '@/components/common/BrandModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { baseClass } from '@/config/constants';
import { cn } from '@/lib/utils';

type PropertyRejectionModal = {
  rejectDialog: {
    open: boolean;
    title: string;
  };
  closeRejectDialog: () => void;
  handleReject: () => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  reviewMutation: {
    isPending: boolean;
  };
};

export const PropertyRejectionModal = ({
  rejectDialog,
  closeRejectDialog,
  handleReject,
  rejectReason,
  setRejectReason,
  reviewMutation,
}: PropertyRejectionModal) => {
  return (
    <BrandModal
      isOpen={rejectDialog.open}
      onClose={(o: boolean) => !o && closeRejectDialog()}
      title="Reject Property"
      className="max-w-sm"
      footer={
        <div className="flex gap-3">
          <BrandButton
            variant={'secondary'}
            className="flex-1"
            onClick={closeRejectDialog}
          >
            Cancel
          </BrandButton>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600"
            disabled={reviewMutation.isPending || !rejectReason.trim()}
            onClick={handleReject}
          >
            {reviewMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Reject Property
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="font-secondary text-gray-600 text-sm">
          Rejecting <strong>{rejectDialog.title}</strong>. The landlord will be
          notified with your reason.
        </p>
        <Textarea
          placeholder="Provide a clear reason for rejection..."
          className={cn('min-h-28 resize-none font-secondary', baseClass)}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </div>
    </BrandModal>
  );
};
