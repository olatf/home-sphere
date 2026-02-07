import { BrandButton } from '@/components/common/BrandButton';
import { FcGoogle } from 'react-icons/fc';
import { Apple } from 'lucide-react';

export const SignProvidersButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4">
      <BrandButton
        brandVariant="secondary"
        className="font-secondary text-md text-brand-dark hover:bg-black hover:text-white"
      >
        <FcGoogle className="size-5" />
        Google
      </BrandButton>
      <BrandButton
        brandVariant="secondary"
        className="font-secondary text-md text-brand-dark hover:bg-black hover:text-white"
      >
        <Apple className="size-5" />
        Apple
      </BrandButton>
    </div>
  );
};
