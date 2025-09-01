import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
  });
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key"
);

// Database types
export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  created_at: string;
  variants?: ProductVariant[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  region?: string;
  city?: string;
  first_name?: string;
  last_name?: string;
  marketing_emails?: boolean;
  created_at: string;
}

export interface UserRegistration {
  name: string;
  email?: string;
  phone_number?: string;
  password: string;
  confirmPassword: string;
  marketing_emails: boolean;
  accept_terms: boolean;
  accept_privacy: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status:
    | "pending"
    | "pending_payment"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled";
  total_amount: number;
  payment_method: "card" | "cod";
  created_at: string;
  guest?: boolean;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_region?: string;
  customer_city?: string;
  payment_intent_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
  size?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postal_code: string;
  country: string;
}
