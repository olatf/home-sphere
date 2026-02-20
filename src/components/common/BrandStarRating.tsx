'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  value?: number;
  defaultValue?: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
};

/**
 * StarRating component.
 *
 * @param {StarRatingProps} props - The props for the StarRating component.
 * @param {number} [props.value] - The value of the rating.
 * @param {number} [props.defaultValue=0] - The default value of the rating.
 * @param {number} [props.max=5] - The maximum value of the rating.
 * @param {number} [props.size=18] - The size of the star icons.
 * @param {boolean} [props.interactive=false] - Whether the component is interactive or not.
 * @param {(rating: number) => void} [props.onChange] - The callback function to be called when the rating changes.
 * @param {boolean} [props.showValue=false] - Whether to show the rating value or not.
 * @param {string} [props.className] - The className of the component.
 * @return {JSX.Element} - The StarRating component.
 */
export const BrandStarRating = ({
  value,
  defaultValue = 0,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const currentValue = value ?? internalValue;

  const handleClick = (rating: number) => {
    if (!interactive) return;

    if (value === undefined) {
      setInternalValue(rating);
    }

    onChange?.(rating);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;

        const isFilled =
          hoverValue !== null
            ? starValue <= hoverValue
            : starValue <= currentValue;

        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-colors duration-200',
              interactive && 'cursor-pointer',
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
            onMouseEnter={() => interactive && setHoverValue(starValue)}
            onMouseLeave={() => interactive && setHoverValue(null)}
            onClick={() => handleClick(starValue)}
          />
        );
      })}

      {showValue && (
        <span className="text-muted-foreground ml-2 text-sm font-medium">
          {currentValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};
