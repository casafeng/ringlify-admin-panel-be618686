import { z } from 'zod';

export const businessFormSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Name must be less than 100 characters'),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (E.164 format)'),
  timezone: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type BusinessFormData = z.infer<typeof businessFormSchema>;

export const knowledgeBaseSchema = z.object({
  address: z.string().optional(),
  hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
  menuHighlights: z.array(z.string()).optional(),
  policies: z.record(z.string()).optional(),
}).passthrough(); // Allow additional fields

export type KnowledgeBaseData = z.infer<typeof knowledgeBaseSchema>;

export const appointmentFilterSchema = z.object({
  businessId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type AppointmentFilters = z.infer<typeof appointmentFilterSchema>;

export const callLogFilterSchema = z.object({
  businessId: z.string().optional(),
  status: z.enum(['pending', 'booked', 'suggested_alternatives', 'failed', 'unavailable']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CallLogFilters = z.infer<typeof callLogFilterSchema>;
