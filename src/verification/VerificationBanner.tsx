'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BrandButton } from '@/components/common/BrandButton';

type Props = {
  type?: 'success' | 'action';
  title?: string;
  message: string;
  dismissed?: boolean;
  actionText?: string;
  onclose?: () => void;
  onAction?: () => void;
};

export const VerificationBanner = ({
  type = 'action',
  title,
  message,
  dismissed,
  onclose,
  actionText,
  onAction,
}: Props) => {
  if (dismissed) return null;

  const colors =
    type === 'success'
      ? {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          buttonText: 'text-white',
        }
      : {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
          buttonText: 'text-white',
        };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`relative z-9999 mb-4 flex max-w-sm flex-col items-center justify-between rounded-xl ${colors.bg} ${colors.border} space-y-3 border px-2 py-3`}
    >
      {title && (
        <h3 className={`font-semibold text-sm ${colors.text}`}>{title}</h3>
      )}
      <p className={`text-center font-medium text-xs ${colors.text}`}>
        {message}
      </p>

      {type === 'action' && actionText && onAction && (
        <div className="flex w-full items-center justify-center">
          <BrandButton
            className={`flex rounded-lg px-3 py-2 font-medium text-xs ${colors.buttonBg} ${colors.buttonText}`}
            onClick={onAction}
          >
            {actionText}
          </BrandButton>
        </div>
      )}

      <BrandButton
        onClick={onclose}
        className="text-gray-500 hover:text-gray-800"
        leftIcon={<X size={16} />}
      />
    </motion.div>
  );
};
