import { safeStr } from '@/helpers/data.helpers';
import Image from 'next/image';

interface BrandAvatarProps {
  size?: number;
  style?: 'character' | 'image';
  value: string;
  src?: string;
  verificationSteps?: {
    email: boolean;
    documents: boolean;
    live: boolean;
  };
}

export const BrandAvatar = ({
  size = 32,
  style = 'character',
  value,
  src,
  verificationSteps,
}: BrandAvatarProps) => {
  const characterStyle = style === 'character';
  const imageStyle = style === 'image';

  const initials = getInitials(value);
  const fontSize = Math.max(size * 0.4, 12);

  const totalSteps = 3;
  const completedSteps =
    (verificationSteps?.email ? 1 : 0) +
    (verificationSteps?.documents ? 1 : 0) +
    (verificationSteps?.live ? 1 : 0);

  const progress = completedSteps / totalSteps;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      {verificationSteps && (
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 4) / 2}
            strokeWidth="3"
            className="stroke-gray-200"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 4) / 2}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={Math.PI * (size - 4)}
            strokeDashoffset={Math.PI * (size - 4) * (1 - progress)}
            className="stroke-green-500 transition-all duration-500"
          />
        </svg>
      )}

      <div
        className="bg-brand-light relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white"
        style={{
          width: size - 6,
          height: size - 6,
        }}
      >
        {imageStyle && (
          <Image src={safeStr(src)} alt={value} fill className="object-cover" />
        )}
        {characterStyle && <span style={{ fontSize }}>{initials}</span>}
      </div>
    </div>
  );
};

const getInitials = (name: string): string => {
  if (!name) return '?';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    const word = words[0];
    return word.length >= 2
      ? word.substring(0, 2).toUpperCase()
      : (word + word.charAt(0)).substring(0, 2).toUpperCase();
  } else {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
};
