'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Send, User } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { submitContactForm } from '@/actions/contact';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { type ContactFormData, contactSchema } from '@/lib/schemas/contact';

export const ContactForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (values: ContactFormData) => {
    startTransition(async () => {
      try {
        const result = await submitContactForm(values);
        if (!result.success) throw new Error(result.error ?? undefined);

        toast.success("Message sent — we'll get back to you shortly.");
        form.reset();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-0 space-y-5 rounded-2xl border bg-white p-6 shadow-sm md:mt-10 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <BrandInput
            name="fullName"
            label="Full Name"
            placeholder="Jane Doe"
            formRef={form}
            required
            leftElement={<User className="size-4 text-gray-400" />}
          />
          <BrandInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            formRef={form}
            required
            leftElement={<Mail className="size-4 text-gray-400" />}
          />
        </div>

        <BrandInput
          name="subject"
          label="Subject"
          placeholder="How can we help?"
          required
          formRef={form}
        />

        <BrandInput
          name="message"
          label="Message"
          variant="textarea"
          required
          placeholder="Tell us more about your request..."
          formRef={form}
        />

        <BrandButton
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto"
          leftIcon={
            isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )
          }
        >
          {isPending ? <>Sending...</> : <>Send Message</>}
        </BrandButton>
      </form>
    </Form>
  );
};
