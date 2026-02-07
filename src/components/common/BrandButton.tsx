import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const brandButtonVariants = cva(
  'flex items-center justify-center font-secondary text-white border border-brand   font-semibold  cursor-pointer duration-300 transition-all ',
  {
    variants: {
      brandVariant: {
        primary:
          'bg-black rounded-[40px] min-h-12 px-8 py-[14px] hover:bg-brand-dark',
        secondary: 'bg-transparent hover:bg-brand-dark',
        tertiary:
          'bg-black min-h-10 px-4 py-2 hover:bg-transparent border border-brand hover:text-brand-dark hover:border-2',
      },
    },
    defaultVariants: {
      brandVariant: 'primary',
    },
  }
);

export interface BrandButtonProps
  extends
    React.ComponentProps<typeof Button>,
    VariantProps<typeof brandButtonVariants> {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const BrandButton = ({
  children,
  className,
  type = 'button',
  brandVariant,
  ...props
}: BrandButtonProps) => {
  return (
    <Button
      type={type}
      className={cn(brandButtonVariants({ brandVariant }), className)}
      {...props}
    >
      {children}
    </Button>
  );
};
