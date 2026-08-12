import { z } from 'zod';

export const locationSchema = z.object({
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  lga: z.string().min(2, 'LGA required'),
  country: z.string().default('Nigeria'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landmark: z.string().optional(),
});

export const featuresSchema = z.object({
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  toilets: z.number().int().min(0).max(20),
  parking_spaces: z.number().int().min(0).max(50),
  floor_area_sqm: z.number().min(1, 'Floor area required'),
  floors: z.number().int().min(1).optional(),
  year_built: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  furnishing: z.enum(['furnished', 'semi_furnished', 'unfurnished']),
  amenities: z.array(z.string()).default([]),
  utilities_included: z.array(z.string()).default([]),
});

export const pricingSchema = z
  .object({
    price: z.number().min(1000, 'Price must be at least ₦1,000'),
    caution_fee: z.number().min(0).optional(),
    //   agency_fee:       z.number().min(0).optional(),
    //   inspection_fee:   z.number().min(0),
    allows_instalment: z.boolean().default(false),
    instalment_plan: z
      .object({
        min_initial_payment_percent: z.number().min(10).max(90),
        duration_months: z.number().int().min(1).max(60),
        interest_rate_percent: z.number().min(0).max(30),
      })
      .optional(),
  })
  .refine(d => !d.allows_instalment || d.instalment_plan !== undefined, {
    message: 'Instalment plan details required',
    path: ['instalment_plan'],
  });

export const createPropertySchema = z
  .object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(150),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters'),
    property_type: z.enum([
      'apartment',
      'house',
      'commercial',
      'land',
      'shortlet',
    ]),
    listing_type: z.enum(['rent', 'lease', 'sale']),
    duration_years: z.number().int().min(1),
    location: locationSchema,
    features: featuresSchema,
    pricing: pricingSchema,
    feature_image: z.string().min(1, 'Feature image required'),
    gallery: z
      .array(z.string())
      .min(1, 'At least 1 gallery image required')
      .max(20),
    proof_of_ownership: z.string().min(1, 'Proof of ownership required'),
    video_tour_url: z.preprocess(
      val =>
        val === '' || val === null || val === undefined ? undefined : val,
      z.string().url().optional()
    ),
    //   legal_services_available: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    available_units: z.number().min(1, 'Available units required'),
  })
  .refine(
    d => {
      if (d.listing_type === 'rent') return d.duration_years <= 2;
      if (d.listing_type === 'lease') return d.duration_years <= 5;
      return true;
    },
    {
      message: 'Rent max 2 years · Lease max 5 years',
      path: ['duration_years'],
    }
  );

export type CreatePropertyFormData = z.infer<typeof createPropertySchema>;

export const bookInspectionSchema = z.object({
  property_id: z.string().uuid(),
  property_type: z.enum([
    'apartment',
    'house',
    'commercial',
    'land',
    'shortlet',
  ]),
  preferred_date: z.string().min(1, 'Preferred date required'),
  notes: z.string().max(500).optional(),
});
export type BookInspectionFormData = z.infer<typeof bookInspectionSchema>;

export const propertyPaymentSchema = z.object({
  property_id: z.string().uuid(),
  listing_type: z.enum(['rent', 'lease', 'sale']),
  duration_years: z.number().int().min(1),
  payment_plan: z.enum(['full', 'instalment']),
  inspection_id: z.string().uuid(),
  legal_services_opted: z.boolean().default(false),
  initial_payment_percent: z.number().min(10).max(100).optional(),
});
export type PropertyPaymentFormData = z.infer<typeof propertyPaymentSchema>;

export const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  done: z.boolean().optional(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const referenceTableSchema = z
  .enum(['properties', 'tenancies', 'inspections', 'users'])
  .optional();
export type ReferenceTable = z.infer<typeof referenceTableSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  assigned_to: z.string().uuid('Select an assignee'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional(),
  attachments: z.array(z.string()).optional(),
  context_id: z.string().uuid().optional(),
  reference_table: referenceTableSchema,

  checklist: z.array(checklistItemSchema).optional(),
});
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const forwardTaskSchema = z.object({
  task_id: z.string().uuid(),
  forward_to: z.string().uuid('Select a user'),
  reason: z.string().min(10, 'Provide a reason'),
});
export type ForwardTaskFormData = z.infer<typeof forwardTaskSchema>;

export const propertyRatingSchema = z.object({
  property_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});
export type PropertyRatingFormData = z.infer<typeof propertyRatingSchema>;
