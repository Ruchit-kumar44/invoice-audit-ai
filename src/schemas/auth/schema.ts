import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  companyName: z
    .string()
    .trim()
    .min(2, "Enter your company name")
    .max(60, "Keep it under 60 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const organizationSchema = z.object({
  companyName: signUpSchema.shape.companyName,
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type OrganizationValues = z.infer<typeof organizationSchema>;