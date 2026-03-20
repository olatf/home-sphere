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
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
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
            <div className="relative h-[300] w-[400]">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => setCameraError(true)}
                className="h-full w-full rounded-xl object-cover"
              />

              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-200">
                  <p className="text-sm text-gray-600">
                    Requesting camera access...
                  </p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-100">
                  <p className="text-sm text-red-500">
                    Camera access denied. Please allow permission.
                  </p>
                </div>
              )}
            </div>

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
