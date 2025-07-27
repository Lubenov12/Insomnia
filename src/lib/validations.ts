import { z } from "zod";

// Product validation schemas
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .trim()
    .refine(
      (val) => val.length > 0,
      "Product name cannot be empty or just whitespace"
    ),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional()
    .default(""),
  price: z
    .number()
    .min(0.01, "Price must be at least 0.01")
    .max(999999.99, "Price cannot exceed 999,999.99")
    .refine((val) => Number.isFinite(val), "Price must be a valid number")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      "Price can have at most 2 decimal places"
    ),
  image_url: z
    .string()
    .url("Invalid image URL format")
    .max(500, "Image URL must be less than 500 characters")
    .optional()
    .or(z.literal(""))
    .default(""),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters")
    .trim()
    .toLowerCase()
    .refine(
      (val) => /^[a-zA-Z0-9\s\-_]+$/.test(val),
      "Category can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  stock_quantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .max(999999, "Stock quantity cannot exceed 999,999"),
});

// Simplified user registration schema
export const userRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be less than 255 characters")
      .trim()
      .refine(
        (val) => val.length > 0,
        "Name cannot be empty or just whitespace"
      )
      .refine(
        (val) => /^[a-zA-ZÀ-ÿ\s\-'\.]+$/.test(val),
        "Name can only contain letters, spaces, hyphens, apostrophes, and dots"
      ),
    email: z
      .string()
      .max(320, "Email must be less than 320 characters")
      .toLowerCase()
      .trim()
      .refine(
        (val) => !val || val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Invalid email format"
      )
      .optional(),
    phone_number: z
      .string()
      .max(20, "Phone number must be less than 20 characters")
      .trim()
      .refine(
        (val) =>
          !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, "")),
        "Invalid phone number format. Use international format (e.g., +359888123456)"
      )
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .refine(
        (val) => /[A-Z]/.test(val),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (val) => /[a-z]/.test(val),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (val) => /\d/.test(val),
        "Password must contain at least one number"
      )
      .refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    // Simple marketing preference
    marketing_emails: z.boolean().optional().default(false),
    // Terms and conditions
    accept_terms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
    accept_privacy: z
      .boolean()
      .refine((val) => val === true, "You must accept the privacy policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.email || data.phone_number, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

export const userLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(320, "Email must be less than 320 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim()
    .refine(
      (val) => /^[a-zA-ZÀ-ÿ\s\-'\.]+$/.test(val),
      "Name can only contain letters, spaces, hyphens, apostrophes, and dots"
    )
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(320, "Email must be less than 320 characters")
    .toLowerCase()
    .trim()
    .optional(),
  phone_number: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .trim()
    .refine(
      (val) =>
        !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, "")),
      "Invalid phone number format"
    )
    .optional(),
  marketing_emails: z.boolean().optional(),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
});

export const updateCartSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
});

// Order validation schemas
export const createOrderSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  payment_method: z.enum(["card", "cod"]),
  shipping_address: z.object({
    address: z.string().min(5, "Shipping address is required"),
    city: z.string().min(2, "City is required"),
    postal_code: z.string().min(4, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1")
          .max(999, "Quantity cannot exceed 999"),
      })
    )
    .min(1, "Order must contain at least one item")
    .max(50, "Order cannot contain more than 50 different items"),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "shipped", "delivered", "cancelled"]),
});

// Favorites validation schemas
export const addToFavoritesSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  product_id: z.string().uuid("Invalid product ID"),
});

// General validation schemas
export const uuidSchema = z.string().uuid("Invalid ID format");
export const paginationSchema = z.object({
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .max(1000, "Page cannot exceed 1000")
    .default(1),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query must be less than 100 characters")
    .trim()
    .optional(),
  category: z
    .string()
    .max(100, "Category must be less than 100 characters")
    .trim()
    .optional(),
});
