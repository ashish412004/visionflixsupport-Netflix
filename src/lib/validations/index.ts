import { z } from 'zod';

export const activationCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'Activation code must be at least 6 characters')
    .max(10, 'Activation code must be at most 10 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Code can only contain letters and numbers'),
  deviceNickname: z
    .string()
    .min(2, 'Device nickname is too short')
    .max(50, 'Device nickname must be under 50 characters')
    .optional(),
  householdLocation: z
    .string()
    .max(60, 'Location must be under 60 characters')
    .optional(),
  notes: z
    .string()
    .max(500, 'Additional notes must be under 500 characters')
    .optional(),
});

export const householdTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be under 100 characters'),
  issueCategory: z.enum([
    'not_in_household_tv_error',
    'travel_temporary_access',
    'network_wifi_change',
    'device_handoff',
    'other'
  ]),
  description: z
    .string()
    .min(20, 'Please provide more details (at least 20 characters)')
    .max(2000, 'Description must be under 2000 characters'),
  deviceNickname: z
    .string()
    .min(2, 'Device name must be at least 2 characters')
    .max(50),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

export const generalTicketSchema = z.object({
  subject: z.string().min(5).max(120),
  type: z.enum(['TV_ACTIVATION', 'HOUSEHOLD_VERIFICATION', 'GENERAL_SUPPORT']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  description: z.string().min(15).max(2500),
  deviceNickname: z.string().max(50).optional(),
});

export const ticketMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(3000, 'Message cannot exceed 3000 characters'),
});

export const adminCustomerUpdateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'super_admin']),
  isActive: z.boolean(),
  maxOpenRequestsLimit: z.number().int().min(1).max(20),
  planCode: z.string(),
  expiresAt: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
