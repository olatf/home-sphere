'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Fragment, useEffect, useState, useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { boolean, z } from 'zod';
import { getSignedUrl } from '@/actions/uploadFile';
import { handleDocumentSubmit } from '@/actions/Verification';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandImageEditor } from '@/components/common/BrandImageEditor';
import { BrandLoader } from '@/components/common/BrandLoader';
import { BrandRadioSelectors } from '@/components/common/BrandRadioSelectors';
import { If } from '@/components/common/If';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUserProfile } from '@/hooks/useUserProfile';
import { VerifyLive } from './VerifyLive';

interface Props {
  open: boolean;
  type: 'live' | 'documents';
  onClose: () => void;
  refresh?: () => void;
}

const documentSchema = z.object({
  documents: z
    .instanceof(File, { message: 'Document is required' })
    .refine(file => file.size <= 5 * 1024 * 1024, {
      message: 'Image must be less than 5MB',
    })
    .refine(file => file.type.startsWith('image/'), {
      message: 'File must be an image',
    }),
  idType: z
    .enum(['NIN', 'PASSPORT', 'DRIVERS_LICENSE'])
    .refine(val => val !== null, {
      message: 'Please select your ID type',
    }),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export const VerificationModal = ({ open, onClose, type, refresh }: Props) => {
  const { profile } = useUserProfile();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingDoc, startTransition] = useTransition();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documents: undefined,
      idType: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open || type !== 'documents') return;
    if (!profile?.verification_img) return;

    const fetchSignedUrl = () => {
      startTransition(async () => {
        try {
          const result = await getSignedUrl(
            profile.verification_img,
            'verification-documents',
            60 * 10
          );

          if (result.url) {
            setSignedUrl(result.url);
          }
        } catch (err) {
          console.error('Failed to fetch signed URL:', err);
        }
      });
    };

    fetchSignedUrl();
  }, [open, type, profile?.verification_img]);

  const onSubmit = async (values: DocumentFormValues) => {
    if (!values.documents) return;

    const formData = new FormData();
    formData.append('documents', values.documents);

    startTransition(async () => {
      const result = await handleDocumentSubmit(formData);

      if (!result.success) {
        const errorMessage = getErrorMessage(result.error);
        toast.error(errorMessage);
        return;
      }

      if (result?.success && result.filePath) {
        const signed = await getSignedUrl(
          result.filePath,
          'verification-documents'
        );

        if (signed.url) {
          setSignedUrl(signed.url);
        }
        toast.success('Document uploaded successfully!');
        refresh?.();
        onClose();
      }
    });
  };

  const DocumentContent = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div>
          <p className="font-secondary font-semibold text-base">
            Document Type
          </p>
          <BrandRadioSelectors<DocumentFormValues['idType']>
            ariaLabel="ID type"
            value={form.getValues('idType')}
            options={[
              { value: 'NIN', label: 'National ID' },
              { value: 'PASSPORT', label: 'Passport' },
              { value: 'DRIVERS_LICENSE', label: "Driver's License" },
            ]}
            onChange={value => form.setValue('idType', value)}
          />
        </div>

        <BrandImageEditor
          name="documents"
          control={form.control}
          existingImageUrl={signedUrl || undefined}
          maxFileSizeMB={5}
        />

        <BrandButton
          type="submit"
          disabled={loadingDoc || !form.formState.isValid}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          {loadingDoc ? (
            <span className="flex items-center gap-4">
              <Loader2 className="animate-spin text-white" /> Uploading...
            </span>
          ) : (
            'Upload Document'
          )}
        </BrandButton>
      </form>
    </FormProvider>
  );

  const LiveContent = (
    <div className="p-4">
      {!boolean ? (
        <div className="text-center text-gray-500 text-sm">
          <BrandLoader />
          Preparing verification...
        </div>
      ) : (
        <VerifyLive userId={profile?.id} />
      )}
    </div>
  );

  const Header = (
    <div className="flex items-center justify-between border-b p-4">
      <DialogTitle>
        {type === 'live' ? 'Live Verification' : 'Document Verification'}
      </DialogTitle>
    </div>
  );

  return (
    <Fragment>
      <If cond={isDesktop}>
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="w-full max-w-3xl overflow-hidden rounded-xl p-0">
            <DialogHeader>{Header}</DialogHeader>

            {type === 'live' && LiveContent}
            {type === 'documents' && DocumentContent}
          </DialogContent>
        </Dialog>
      </If>

      <If cond={!isDesktop}>
        <Drawer open={open} onOpenChange={onClose}>
          <DrawerContent className="w-full max-w-3xl overflow-hidden rounded-xl p-0">
            <DrawerHeader>{Header}</DrawerHeader>

            {type === 'live' && LiveContent}
            {type === 'documents' && DocumentContent}
          </DrawerContent>
        </Drawer>
      </If>
    </Fragment>
  );
};
