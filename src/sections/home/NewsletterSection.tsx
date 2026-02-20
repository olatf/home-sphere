'use client';

import { useState } from 'react';
import { BrandButton } from '@/components/common/BrandButton';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <section className="bg-brand-dark py-20 text-white">
      <div className="container mx-auto px-6 text-center lg:px-12">
        <h2 className="mb-6 text-4xl font-bold">Stay Updated</h2>

        <p className="mx-auto mb-8 max-w-xl text-zinc-200">
          Subscribe to our newsletter and receive property updates and exclusive
          offers.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full rounded-sm border-b border-white p-3 text-white focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <BrandButton
            type="submit"
            brandVariant="secondary"
            className="rounded-2xl bg-black px-6 py-6 hover:bg-white hover:text-zinc-900"
          >
            Subscribe
          </BrandButton>
        </form>
      </div>
    </section>
  );
};
