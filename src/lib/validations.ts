import { z } from "zod";
import { PRODUCT_CATEGORIES, ORDER_STATUSES } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.enum(PRODUCT_CATEGORIES as [string, ...string[]]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export const checkoutSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  contact_number: z
    .string()
    .min(10, "Please enter a valid contact number")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  shipping_address: z.string().min(10, "Please enter a complete shipping address"),
  delivery_notes: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
