import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long').optional(),
});

export const sendOtpSchema = z.object({
  phone: z.string({ required_error: 'Phone number is required' }).min(10, 'Phone number must be at least 10 digits'),
});

export const verifyOtpSchema = z.object({
  phone: z.string({ required_error: 'Phone number is required' }),
  code: z.string({ required_error: 'OTP code is required' }).length(6, 'OTP must be exactly 6 digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
