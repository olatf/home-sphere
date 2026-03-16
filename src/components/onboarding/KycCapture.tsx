'use client';

import Webcam from 'react-webcam';
import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { OnboardingValues } from '@/lib/schemas/onboarding';
import { BrandInput } from '@/components/common/BrandInput';
import Image from 'next/image';
import { Trash2, CameraIcon } from 'lucide-react';
import { BrandButton } from '../common/BrandButton';

export default function KycCapture({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  const webcamRef = useRef<Webcam>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const captureSelfie = () => {
    const img = webcamRef.current?.getScreenshot();
    if (img) {
      setSelfie(img);
      form.setValue('selfieImage', img);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-secondary text-base font-semibold">
        {selfie ? 'Your Selfie' : 'Take Selfie'}
      </h2>

      <div>
        {!selfie ? (
          <div className="flex flex-col items-start gap-2">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="object-fit h-[300] w-[400] rounded-xl"
            />

            <BrandButton
              type="button"
              brandVariant="tertiary"
              onClick={captureSelfie}
              className="hover:text-green-500"
            >
              <CameraIcon className="size-4 hover:text-green-500" />
              Capture Selfie
            </BrandButton>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <Image
              src={selfie}
              alt="Selfie preview"
              width={300}
              height={300}
              className="object-fit rounded-xl"
            />
            <BrandButton
              type="button"
              brandVariant="tertiary"
              onClick={() => setSelfie(null)}
              className="hover:text-red-500"
            >
              <Trash2 className="size-4 hover:text-red-500" /> Remove Selfie
            </BrandButton>
          </div>
        )}
      </div>

      <BrandInput
        formRef={form}
        name="consent"
        label="Consent to data processing"
        placeholder="I consent to my data being verified and processed"
        variant="checkbox"
        required
      />
    </div>
  );
}
