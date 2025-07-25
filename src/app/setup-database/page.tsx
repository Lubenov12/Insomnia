'use client';

import { useState } from 'react';

export default function SetupDatabasePage() {
  const [step, setStep] = useState(1);

  const migrationSQL1 = `/*
  # E-commerce Database Schema

  1. New Tables
    - \`products\` - Store product information with inventory tracking
    - \`users\` - User accounts with authentication and profile data
    - \`orders\` - Order management with status tracking
    - \`order_items\` - Individual items within orders
    - \`favorites\` - User wishlist functionality
    - \`cart_items\` - Shopping cart persistence

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure user data access
    - Prevent unauthorized modifications

  3. Relationships
    - Foreign key constraints between all related tables
    - Proper indexing for performance
    - Cascade deletes where appropriate
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  address text DEFAULT '',
  phone_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method text NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'cod')),
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products can be managed by authenticated users"
  ON products FOR ALL
  TO authenticated
  USING (true);

-- Users policies (users can only access their own data)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Orders policies (users can only access their own orders)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Order items policies (users can only access items from their orders)
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Favorites policies (users can only access their own favorites)
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cart items policies (users can only access their own cart)
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
  ('Черна тениска', 'Удобна черна тениска от 100% памук', 25.00, 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg', 'тениски', 50),
  ('Сини дънки', 'Класически сини дънки с удобна кройка', 65.00, 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', 'панталони', 30),
  ('Бяла риза', 'Елегантна бяла риза за официални поводи', 45.00, 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg', 'ризи', 25),
  ('Червена рокля', 'Красива червена рокля за специални случаи', 85.00, 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg', 'рокли', 15),
  ('Спортни обувки', 'Удобни спортни обувки за ежедневие', 120.00, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 'обувки', 40)
ON CONFLICT DO NOTHING;`;

  const migrationSQL2 = `/*
  # Add Stock Management Function

  1. Functions
    - \`decrement_stock\` - Safely decrements product stock quantity
    - Prevents negative stock values
    - Returns updated stock quantity

  2. Security
    - Function is accessible to authenticated users
    - Includes proper error handling
*/

-- Create function to safely decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, quantity integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  -- Get current stock with row lock
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;
  
  -- Check if product exists
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Calculate new stock
  new_stock := current_stock - quantity;
  
  -- Prevent negative stock
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, quantity;
  END IF;
  
  -- Update stock
  UPDATE products
  SET stock_quantity = new_stock
  WHERE id = product_id;
  
  RETURN new_stock;
END;
$$;`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('SQL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Setup Guide</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {i}
                </div>
                {i < 4 && <div className={`w-16 h-1 ${step > i ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 1: Update Environment Variables</h2>
              <p className="mb-4">First, update your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file with your actual Supabase credentials:</p>
              <div className="bg-gray-100 p-4 rounded mb-4">
                <p className="text-sm mb-2">1. Go to your Supabase dashboard</p>
                <p className="text-sm mb-2">2. Navigate to Settings → API</p>
                <p className="text-sm mb-2">3. Copy your Project URL and anon public key</p>
                <p className="text-sm">4. Replace the placeholder values in .env.local</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next: Create Database Tables
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 2: Create Database Tables (Part 1)</h2>
              <p className="mb-4">Copy and run this SQL in your Supabase SQL Editor:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded mb-4 max-h-96 overflow-y-auto">
                <pre className="text-xs">{migrationSQL1}</pre>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => copyToClipboard(migrationSQL1)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copy SQL to Clipboard
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Open Supabase Dashboard
                </a>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Go to your Supabase dashboard → SQL Editor → New query, paste the SQL above, and click "Run"
              </p>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next: Add Stock Function
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 3: Add Stock Management Function</h2>
              <p className="mb-4">Copy and run this additional SQL in your Supabase SQL Editor:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded mb-4 max-h-96 overflow-y-auto">
                <pre className="text-xs">{migrationSQL2}</pre>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => copyToClipboard(migrationSQL2)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copy SQL to Clipboard
                </button>
              </div>
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next: Test Connection
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 4: Test Your Database Connection</h2>
              <p className="mb-4">Now let's test if everything is working correctly:</p>
              <div className="space-y-3">
                <a
                  href="/test-connection"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                >
                  Test Database Connection
                </a>
                <a
                  href="/api/products"
                  target="_blank"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
                >
                  Test Products API
                </a>
              </div>
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✅ Setup Complete!</h3>
                <p className="text-green-700 text-sm">
                  Your database should now be ready. If the tests pass, you can start using your e-commerce API endpoints.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What This Setup Creates:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
            <li><strong>Products table:</strong> Store your clothing items with prices, images, and stock</li>
            <li><strong>Users table:</strong> Customer profiles linked to Supabase Auth</li>
            <li><strong>Orders & Order Items:</strong> Complete order management system</li>
            <li><strong>Cart & Favorites:</strong> Shopping cart and wishlist functionality</li>
            <li><strong>Security:</strong> Row Level Security policies to protect user data</li>
            <li><strong>Sample Data:</strong> 5 sample products to get you started</li>
          </ul>
        </div>
      </div>
    </div>
  );
}