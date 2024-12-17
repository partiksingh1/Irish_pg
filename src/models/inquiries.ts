import { z } from 'zod';

// Define the Zod schema for the inquiry request body
export const InquirySchema = z.object({
  message: z
    .string()
    .min(1, { message: 'Message cannot be empty' })  // Ensure message is not empty
    .max(1000, { message: 'Message cannot exceed 1000 characters' }) // Optional: Limit the length
});
