'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { baseClass } from '@/config/constants';
import { cn } from '@/lib/utils';

export const composeSchema = z.object({
  to: z.string().min(1, 'Recipient required'),
  subject: z.string().min(1, 'Subject required'),
  body: z.string().min(1, 'Message required'),
});

export type ComposeFormData = z.infer<typeof composeSchema>;

export const ComposeModal = ({
  open,
  onClose,
  onSend,
  sending,
  isMobile,
}: {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  onSend: (d: ComposeFormData) => Promise<void>;
  sending: boolean;
}) => {
  const form = useForm<ComposeFormData>({
    resolver: zodResolver(composeSchema),
    defaultValues: { to: '', subject: '', body: '' },
  });

  function handleClose() {
    form.reset();
    onClose();
  }

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSend)} className="space-y-4">
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary text-gray-500 text-xs">
                To (user ID or email)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="user@email.com"
                  className={cn('font-secondary', baseClass)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary text-gray-500 text-xs">
                Subject
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Subject..."
                  className={cn('font-secondary', baseClass)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary text-gray-500 text-xs">
                Message
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your message here..."
                  className={cn(
                    'min-h-40 resize-none font-secondary',
                    baseClass
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-brand hover:bg-brand-dark"
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Message
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={o => !o && handleClose()}>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle className="text-left font-primary">
              Compose Message
            </DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-primary">Compose Message</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
