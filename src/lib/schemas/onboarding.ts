import { id } from 'date-fns/locale';
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
  dateOfBirth: z.date({
    error: 'Date of birth is required',
  }),
  bio: z.string().optional(),
  interest: z.array(z.string()).min(1, 'Add at least one interest'),
  idNumber: z.string().min(7, 'ID number is required'),
  idType: z
    .enum(['NIN', 'PASSPORT', 'DRIVERS_LICENSE'])
    .refine(val => val !== null, {
      message: 'Please select your ID type',
    }),
  meansOfIdentification: z
    .union([z.instanceof(File), z.string()])
    .refine(
      val => {
        if (val instanceof File) {
          return val.size <= 5 * 1024 * 1024; // 5MB max
        }
        return true;
      },
      { message: 'Image must be less than 5MB' }
    )
    .refine(
      val => {
        if (val instanceof File) {
          return val.type.startsWith('image/');
        }
        return true;
      },
      { message: 'File must be an image' }
    ),
  selfieImage: z
    .union([z.instanceof(File), z.string()])
    .refine(
      val => {
        if (val instanceof File) {
          return val.size <= 5 * 1024 * 1024; // 5MB max
        }
        return true;
      },
      { message: 'Image must be less than 5MB' }
    )
    .refine(
      val => {
        if (val instanceof File) {
          return val.type.startsWith('image/');
        }
        return true;
      },
      { message: 'File must be an image' }
    ),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must give consent to proceed',
  }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
