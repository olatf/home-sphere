import { Apple } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BrandButton } from '@/components/common/BrandButton';

export const SignProvidersButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4">
      <BrandButton
        variant="secondary"
        className="font-secondary text-brand-dark text-md hover:bg-black hover:text-white"
      >
        <FcGoogle className="size-5" />
        Google
      </BrandButton>
      <BrandButton
        variant="secondary"
        className="font-secondary text-brand-dark text-md hover:bg-black hover:text-white"
      >
        <Apple className="size-5" />
        Apple
      </BrandButton>
    </div>
  );
};
