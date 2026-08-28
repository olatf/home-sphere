'use client';

import { Loader2, Mail } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { subscribeToNewsletter } from '@/actions/newsletter';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import { getErrorMessage } from '@/helpers/error.helpers';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await subscribeToNewsletter(email);
        if (!result.success) throw new Error(result.error ?? undefined);

        toast.success("You're subscribed! Watch your inbox for updates.");
        setEmail('');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <section className="bg-brand-primary-dark py-20 text-white">
      <div className="container mx-auto px-6 text-center">
        <Mail className="mx-auto mb-5 size-9 text-white/70" />
        <h2 className="mb-3 font-bold font-primary text-3xl md:text-4xl">
          Stay in the loop
        </h2>
        <p className="mx-auto mb-8 max-w-lg font-secondary text-white/70">
          Get new listings, rental tips, and market updates delivered to your
          inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-lg flex-col items-center gap-3 sm:flex-row"
        >
          <div className="flex-1">
            <BrandInput
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(val: FormValue) => setEmail(val as string)}
              disabled={isPending}
              leftElement={<Mail className="size-4 text-white/70" />}
            />
          </div>
          <BrandButton
            type="submit"
            variant="primaryDark"
            disabled={isPending}
            className="shrink-0"
            leftIcon={
              isPending ? <Loader2 className="size-4 animate-spin" /> : null
            }
          >
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </BrandButton>
        </form>
      </div>
    </section>
  );
};
