'use client';

import { CheckCircle2, Eye, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { capitalizeWords } from '@/helpers/formatters.helpers';
import { useReviewProperty } from '@/hooks/useProperty';
import { hasPermission, type Role } from '@/lib/accessPolice';
import type { PropertyRow } from './AdminPropertyView';
import { PropertyRejectionModal } from './PropertyRejectionModal';

interface AdminPropertyActionsProps {
  property: PropertyRow;
  buttonShowStyle?: 'grand' | 'trad';
  role: Role;
  covered_by_legal_services?: boolean;
}

export const AdminPropertyActions = ({
  property,
  buttonShowStyle = 'grand',
  role,
  covered_by_legal_services = false,
}: AdminPropertyActionsProps) => {
  const router = useRouter();
  const reviewMutation = useReviewProperty();

  const isPending =
    property.status === 'pending_review' || property.status === 'revised';
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    'approve' | 'reject' | null
  >(null);

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    propertyId: string;
    title: string;
  }>({ open: false, propertyId: '', title: '' });
  const [rejectReason, setRejectReason] = useState('');

  const CanManageProperty = hasPermission(role, 'manage-properties:access');
  async function handleApprove(id: string) {
    setActionLoading('approve');

    const r = await reviewMutation.mutateAsync({
      propertyId: id,
      action: 'approve',
      providing_legal_ads: covered_by_legal_services,
    });

    setActionLoading(null);

    if (r.success) {
      toast.success('Property approved');
      window.location.reload();
    } else toast.error(r.error);
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error('Provide reason');
      return;
    }

    setActionLoading('reject');

    const r = await reviewMutation.mutateAsync({
      propertyId: rejectDialog.propertyId,
      action: 'reject',
      rejectionReason: rejectReason,
    });

    setActionLoading(null);

    if (r.success) {
      toast.success('Rejected');
      closeRejectDialog();
      window.location.reload();
    } else toast.error(r.error);
  }

  function closeRejectDialog() {
    if (reviewMutation.isPending) return;
    setRejectDialog({ open: false, propertyId: '', title: '' });
    setRejectReason('');
  }

  return (
    <>
      {buttonShowStyle === 'grand' ? (
        <Button
          size="sm"
          variant="outline"
          className="px-3"
          onClick={() => router.push(`/admin/properties/${property.id}`)}
        >
          <Eye className="mr-1.5 size-3.5" /> View
        </Button>
      ) : (
        <p className="font-secondary text-gray-400 text-xs">Admin Actions</p>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {isPending || showActions ? (
          <>
            <Button
              disabled={actionLoading !== null || !CanManageProperty}
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleApprove(property.id)}
            >
              {actionLoading === 'approve' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5" /> Approve
                </>
              )}
            </Button>

            <Button
              disabled={actionLoading !== null || !CanManageProperty}
              className="border bg-transparent text-red-500 hover:bg-red-50"
              onClick={() =>
                setRejectDialog({
                  open: true,
                  propertyId: property.id,
                  title: property.title,
                })
              }
            >
              {actionLoading === 'reject' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <XCircle className="mr-1.5" /> Reject
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="shrink-0 items-center gap-2 space-y-3">
            {buttonShowStyle === 'trad' && (
              <p>This property has been {capitalizeWords(property.status)}</p>
            )}
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!CanManageProperty}
              onClick={() => setShowActions(true)}
            >
              Review Action
            </Button>
          </div>
        )}
      </div>

      <PropertyRejectionModal
        rejectDialog={rejectDialog}
        closeRejectDialog={closeRejectDialog}
        handleReject={handleReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        reviewMutation={reviewMutation}
      />
    </>
  );
};
