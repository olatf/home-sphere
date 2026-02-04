import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const brandButtonVariants = cva(
  "flex items-center justify-center text-white border border-brand rounded-[40px]  font-semibold min-h-12 px-8 py-[14px] cursor-pointer duration-300 transition-all hover:bg-brand",
  {
    variants: {
      brandVariant: {
        primary: "bg-black",
        secondary: "bg-transparent",
      },
    },
    defaultVariants: {
      brandVariant: "primary",
    },
  }
);

export interface BrandButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof brandButtonVariants> {
  children: React.ReactNode;
  className?: string;
}

export const BrandButton = ({
  children,
  className,
  brandVariant,
  ...props
}: BrandButtonProps) => {
  return (
    <Button
      className={cn(brandButtonVariants({ brandVariant }), className)}
      {...props}
    >
      {children}
    </Button>
  );
};
