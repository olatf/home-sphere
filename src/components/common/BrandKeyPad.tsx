'use client';

import { BrandButton } from '@/components/common/BrandButton';
import { Delete } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export const BrandKeyPad = ({
  pin,
  setPin,
}: {
  pin: string;
  setPin: Dispatch<SetStateAction<string>>;
}) => {
  const handleKeyPress = (num: number) => {
    if (pin.length >= 4) return;
    setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        <BrandButton
          key={num}
          onClick={() => handleKeyPress(num)}
          className="h-14 rounded-xl bg-gray-100 text-lg font-semibold text-zinc-900 hover:bg-gray-200"
        >
          {num}
        </BrandButton>
      ))}
      <div />

      <BrandButton
        onClick={() => handleKeyPress(0)}
        className="h-14 rounded-xl bg-gray-100 text-lg font-semibold text-zinc-900 hover:bg-gray-200"
      >
        0
      </BrandButton>

      <BrandButton
        onClick={handleDelete}
        className="flex h-14 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100"
      >
        <Delete className="size-5 text-red-500" />
      </BrandButton>
    </div>
  );
};
