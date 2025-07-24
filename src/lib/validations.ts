import { z } from 'zod';

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'Price must be positive'),
  image_url: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  stock_quantity: z.number().int().min(0, 'Stock must be non-negative'),
});

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().max(500).optional(),
  phone_number: z.string().max(20).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  address: z.string().max(500).optional(),
  phone_number: z.string().max(20).optional(),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Order validation schemas
export const createOrderSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  payment_method: z.enum(['card', 'cod'], {
    errorMap: () => ({ message: 'Payment method must be card or cod' }),
  }),
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Order must contain at least one item'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

// Favorites validation schemas
export const addToFavoritesSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  product_id: z.string().uuid('Invalid product ID'),
});

// General validation schemas
export const uuidSchema = z.string().uuid('Invalid ID format');
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});