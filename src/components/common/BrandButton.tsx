'use client';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const brandButtonVariants = cva(
  'inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap font-primary font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'rounded-lg bg-brand-primary text-white shadow-sm hover:-translate-y-px hover:bg-brand-primary/90 hover:shadow-md focus-visible:ring-brand-primary active:bg-brand-primary/80',
        primaryDark:
          'rounded-lg bg-white text-brand-primary shadow-sm hover:-translate-y-px hover:bg-gray-100 hover:shadow-md focus-visible:ring-white active:bg-gray-200',
        outline:
          'rounded-lg border-2 border-darker-grey bg-transparent text-brand-black hover:bg-brand-primary hover:text-white focus-visible:ring-gray-900 active:bg-gray-800',
        outlineDark:
          'rounded-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-gray-900 focus-visible:ring-white active:bg-gray-100',
        ghost:
          'rounded-lg bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400 active:bg-gray-200',
        destructive:
          'rounded-lg bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500 active:bg-red-700',
        secondary:
          'rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-gray-300 active:bg-gray-100',
        link: 'rounded-none text-brand-primary underline-offset-4 hover:underline focus-visible:ring-brand-primary',
      },
      size: {
        xs: 'h-7 rounded-md px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-13 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const leadingIcon = isLoading ? (
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
    ) : (
      (leftIcon ?? null)
    );

    const trailingIcon = !isLoading && rightIcon ? rightIcon : null;

    const sharedClassName = cn(
      brandButtonVariants({ variant, size }),
      className
    );

    if (asChild) {
      // When asChild renders a non-button element such as <a> or <Link>,
      // disabled is only represented with aria-disabled/data-disabled and click
      // prevention. The child may still be focusable, so avoid disabled asChild
      // for flows that require native button disabled semantics.
      return (
        <Slot
          ref={ref}
          {...props}
          className={sharedClassName}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          data-disabled={isDisabled || undefined}
          onClick={
            isDisabled
              ? (e: React.MouseEvent) => e.preventDefault()
              : props.onClick
          }
        >
          {leadingIcon}
          <Slottable>{children}</Slottable>
          {trailingIcon}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        {...props}
        type={props.type ?? 'button'}
        className={sharedClassName}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </button>
    );
  }
);
BrandButton.displayName = 'BrandButton';

export { BrandButton, brandButtonVariants };
