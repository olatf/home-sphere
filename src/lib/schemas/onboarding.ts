import { z } from 'zod';

export const onboardingSchema = z.object({
  role: z
    .enum(['landlord', 'tenant', 'agent'])
    .refine(value => value !== null, {
      message: 'Please select a role',
    }),
  phone: z
    .string()
    .min(5, 'Phone number is required')
    .refine(val => val.startsWith('+'), {
      message: 'Invalid international phone number',
    }),
  nationality: z.string(),
  city: z.string(),
  dateOfBirth: z.date(),
  bio: z.string().optional(),
  interests: z.string().optional(),
  meansOfIdentification: z.file().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must give consent to proceed',
  }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
