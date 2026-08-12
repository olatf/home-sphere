'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface BrandModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const BrandModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: BrandModalProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    // Desktop
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            'flex h-[75vh] max-h-full! w-md flex-col gap-0 p-0',
            className
          )}
        >
          <DialogHeader className="shrink-0 border-gray-200 border-b p-3">
            <DialogTitle className="font-bold text-2xl">{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto px-3 [scrollbar-width:thin]">
            {children}
          </div>

          {footer && (
            <DialogFooter className="shrink-0 border-gray-200 border-t p-3">
              {footer}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile
  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="bottom">
      <DrawerContent className="flex h-[75vh] max-h-full! flex-col gap-0 p-0">
        <DrawerHeader className="shrink-0 border-gray-200 border-b p-6">
          <DrawerTitle className="font-bold text-2xl">{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-auto px-2">{children}</div>

        {footer && (
          <DrawerFooter className="shrink-0 border-gray-200 border-t p-6">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
