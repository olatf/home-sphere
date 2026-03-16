'use client';

import { useState, useCallback, useTransition } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { toast } from 'sonner';
import { getErrorMessage } from '@/helpers/error.helpers';
import { Loader2 } from 'lucide-react';

export const NewsletterSection = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
  });

  const [subscribing, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      startTransition(async () => {
        try {
          const res = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Subscription failed');
          }

          toast.success('Successfully subscribed to newsletter!');

          // reset form
          setFormData({
            fullName: '',
            email: '',
            phone: '',
          });
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      });
    },
    [formData]
  );
  return (
    <section className="bg-brand-dark py-20 text-white">
      <div className="container mx-auto px-6 text-center lg:px-12">
        <h2 className="mb-6 text-4xl font-bold">Stay Updated</h2>

        <p className="mx-auto mb-8 max-w-xl text-zinc-200">
          Subscribe to our newsletter and receive property updates and exclusive
          offers.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <input
              type="text"
              required
              name="firstName"
              placeholder="First Name"
              className="w-full rounded-sm border-b border-white p-3 text-white focus:outline-none"
              value={formData.fullName}
              onChange={handleChange}
            />
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-sm border-b border-white p-3 text-white focus:outline-none"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="number"
              required
              name="phone"
              placeholder="Phone No"
              className="w-full [appearance:textfield] rounded-sm border-b border-white p-3 text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="my-9 flex w-full items-center justify-center">
            <BrandButton
              type="submit"
              brandVariant="primary"
              className="rounded-2xl bg-black hover:bg-white hover:text-zinc-900"
            >
              {subscribing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Subscribing...
                </span>
              ) : (
                'Subscribe'
              )}
            </BrandButton>
          </div>
        </form>
      </div>
    </section>
  );
};
