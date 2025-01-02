import { z } from 'zod';

// Salesperson Signup Validation Schema


export const UserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password_hash: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUYER", "SELLER", "ADMIN"], {
    errorMap: () => ({ message: "Invalid role" })
  }),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  profile_picture: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});