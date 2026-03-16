'use client';

import { useState } from 'react';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { VerificationModal } from '@/verification/VerificationModal';
import { VerificationBanner } from '@/verification/VerificationBanner';

export const DashboardVerificationWidget = ({
  onRefresh,
}: {
  onRefresh?: () => void;
}) => {
  const {
    isDocumentsVerified,
    isLiveVerified,
    isFullyVerified,
    canVerifyLive,
    needsDocumentsReUpload,
    verificationStatus,
    isLoading,
  } = useVerificationStatus();

  const [modalType, setModalType] = useState<'live' | 'documents'>('documents');

  const [modalControl, setModalControls] = useState({
    openVerificationModal: false,
    openNotificationModal: false,
  });

  const handleOpenDocumentModal = () => {
    setModalType('documents');
    setModalControls(prev => ({
      ...prev,
      openVerificationModal: true,
      openNotificationModal: true,
    }));
  };

  const handleOpenLivenessModal = () => {
    setModalType('live');
    setModalControls(prev => ({
      ...prev,
      openVerificationModal: true,
      openNotificationModal: true,
    }));
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  // Fully verified - nothing to show
  if (isFullyVerified || isLoading) {
    return null;
  }

  // Not started or email verified but documents not submitted
  if (!isDocumentsVerified && verificationStatus === 'not_started') {
    return (
      <VerificationBanner
        type="action"
        title="Complete Your Verification"
        message="Start your verification by uploading your ID document."
        actionText="Upload Document"
        dismissed={modalControl.openNotificationModal}
        onclose={() =>
          setModalControls(prev => ({
            ...prev,
            openNotificationModal: true,
          }))
        }
        onAction={handleOpenDocumentModal}
      />
    );
  }

  // Documents submitted and pending
  if (verificationStatus === 'documents_submitted' && !isDocumentsVerified) {
    return (
      <VerificationBanner
        type="action"
        title="Documents Under Review"
        dismissed={modalControl.openNotificationModal}
        onclose={() =>
          setModalControls(prev => ({ ...prev, openNotificationModal: true }))
        }
        message="Your ID document is being verified. This usually takes 5-10 minutes."
      />
    );
  }

  // Documents failed - need re-upload
  if (needsDocumentsReUpload && verificationStatus === 'documents_failed') {
    return (
      <>
        <VerificationBanner
          type="action"
          title="Document Verification Failed"
          message="Please upload a clearer image of your ID document to continue."
          actionText="Re-upload Document"
          dismissed={modalControl.openNotificationModal}
          onclose={() =>
            setModalControls(prev => ({
              ...prev,
              openNotificationModal: true,
            }))
          }
          onAction={handleOpenDocumentModal}
        />
        <VerificationModal
          open={modalControl.openVerificationModal}
          type={modalType}
          onClose={() =>
            setModalControls(prev => ({
              ...prev,
              openVerificationModal: false,
              openNotificationModal: false,
            }))
          }
          refresh={handleRefresh}
        />
      </>
    );
  }

  // Documents approved - ready for liveness
  if (canVerifyLive && verificationStatus === 'documents_approved') {
    return (
      <>
        <VerificationBanner
          type="action"
          title="Ready for Final Verification"
          message="Your ID has been verified. Complete liveness verification to unlock full access."
          actionText="Verify Identity (Liveness)"
          onAction={handleOpenLivenessModal}
        />
        <VerificationModal
          open={modalControl.openVerificationModal}
          type={modalType}
          onClose={() =>
            setModalControls(prev => ({
              ...prev,
              openVerificationModal: false,
              openNotificationModal: false,
            }))
          }
          refresh={handleRefresh}
        />
      </>
    );
  }

  // Liveness pending/failed
  if (!isLiveVerified && verificationStatus === 'live_pending') {
    return (
      <>
        <VerificationBanner
          type="action"
          title="Liveness Verification Failed"
          message="Please try again. Make sure you're in good lighting and your face is clearly visible."
          actionText="Retry Liveness"
          onAction={handleOpenLivenessModal}
        />
        <VerificationModal
          open={modalControl.openVerificationModal}
          type={modalType}
          onClose={() =>
            setModalControls(prev => ({
              ...prev,
              openVerificationModal: false,
              openNotificationModal: false,
            }))
          }
          refresh={handleRefresh}
        />
      </>
    );
  }

  return null;
};
