/*
  # Add Enhanced Database Constraints and Validation

  1. Enhanced Constraints
    - Add check constraints for data validation
    - Add triggers for automatic data cleaning
    - Add indexes for better performance
    - Add functions for data validation

  2. Data Integrity
    - Ensure email formats are valid
    - Ensure phone numbers follow international format
    - Ensure prices are properly formatted
    - Ensure stock quantities are realistic

  3. Performance Optimizations
    - Add composite indexes for common queries
    - Add partial indexes for filtered queries
*/

-- Add enhanced constraints to products table
DO $$
BEGIN
  -- Add constraint for product name (no empty strings after trim)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_name_not_empty'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_name_not_empty 
    CHECK (length(trim(name)) > 0 AND length(name) <= 255);
  END IF;

  -- Add constraint for category format
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_category_format'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_category_format 
    CHECK (length(trim(category)) > 0 AND length(category) <= 100 AND category ~ '^[a-zA-Z0-9\s\-_]+$');
  END IF;

  -- Add constraint for price precision
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_price_precision'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_price_precision 
    CHECK (price >= 0.01 AND price <= 999999.99);
  END IF;

  -- Add constraint for description length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_description_length'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_description_length 
    CHECK (length(description) <= 2000);
  END IF;

  -- Add constraint for image URL length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_image_url_length'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_image_url_length 
    CHECK (length(image_url) <= 500);
  END IF;

  -- Add constraint for realistic stock quantities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_stock_realistic'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_stock_realistic 
    CHECK (stock_quantity >= 0 AND stock_quantity <= 999999);
  END IF;
END $$;

-- Add enhanced constraints to users table
DO $$
BEGIN
  -- Add constraint for name format (letters, spaces, hyphens, apostrophes, dots only)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_name_format'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_name_format 
    CHECK (length(trim(name)) > 0 AND length(name) <= 255 AND name ~ '^[a-zA-ZÀ-ÿ\s\-''\.]+$');
  END IF;

  -- Add constraint for email format
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_email_format'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_format 
    CHECK (length(email) <= 320 AND email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  END IF;

  -- Add constraint for address length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_address_length'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_address_length 
    CHECK (length(address) <= 500);
  END IF;

  -- Add constraint for phone number format
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_phone_format'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_phone_format 
    CHECK (length(phone_number) <= 20 AND (phone_number = '' OR phone_number ~ '^\+?[1-9]\d{1,14}$'));
  END IF;
END $$;

-- Add enhanced constraints to orders table
DO $$
BEGIN
  -- Add constraint for realistic order amounts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'orders_amount_realistic'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_amount_realistic 
    CHECK (total_amount >= 0.01 AND total_amount <= 999999.99);
  END IF;
END $$;

-- Add enhanced constraints to order_items table
DO $$
BEGIN
  -- Add constraint for realistic quantities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'order_items_quantity_realistic'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_realistic 
    CHECK (quantity > 0 AND quantity <= 999);
  END IF;

  -- Add constraint for realistic unit prices
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'order_items_price_realistic'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_price_realistic 
    CHECK (unit_price >= 0.01 AND unit_price <= 999999.99);
  END IF;
END $$;

-- Add enhanced constraints to cart_items table
DO $$
BEGIN
  -- Add constraint for realistic cart quantities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'cart_items_quantity_realistic'
  ) THEN
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_realistic 
    CHECK (quantity > 0 AND quantity <= 999);
  END IF;
END $$;

-- Create function to clean and validate email addresses
CREATE OR REPLACE FUNCTION clean_email(email_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Convert to lowercase and trim whitespace
  RETURN lower(trim(email_input));
END;
$$;

-- Create function to clean and validate names
CREATE OR REPLACE FUNCTION clean_name(name_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Trim whitespace and ensure proper capitalization
  RETURN trim(regexp_replace(name_input, '\s+', ' ', 'g'));
END;
$$;

-- Create function to validate and format phone numbers
CREATE OR REPLACE FUNCTION clean_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove common formatting characters and validate
  IF phone_input IS NULL OR phone_input = '' THEN
    RETURN '';
  END IF;
  
  -- Remove spaces, hyphens, parentheses
  phone_input := regexp_replace(phone_input, '[\s\-\(\)]', '', 'g');
  
  -- Validate format
  IF phone_input ~ '^\+?[1-9]\d{1,14}$' THEN
    RETURN phone_input;
  ELSE
    RAISE EXCEPTION 'Invalid phone number format: %', phone_input;
  END IF;
END;
$$;

-- Add triggers to automatically clean data on insert/update
CREATE OR REPLACE FUNCTION trigger_clean_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := clean_email(NEW.email);
  NEW.name := clean_name(NEW.name);
  NEW.phone_number := clean_phone(NEW.phone_number);
  NEW.address := trim(NEW.address);
  RETURN NEW;
END;
$$;

-- Create trigger for users table
DROP TRIGGER IF EXISTS clean_user_data_trigger ON users;
CREATE TRIGGER clean_user_data_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_clean_user_data();

-- Add trigger to clean product data
CREATE OR REPLACE FUNCTION trigger_clean_product_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name := trim(NEW.name);
  NEW.description := trim(NEW.description);
  NEW.category := lower(trim(NEW.category));
  NEW.image_url := trim(NEW.image_url);
  RETURN NEW;
END;
$$;

-- Create trigger for products table
DROP TRIGGER IF EXISTS clean_product_data_trigger ON products;
CREATE TRIGGER clean_product_data_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_clean_product_data();

-- Add composite indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_stock 
ON products(category, stock_quantity) WHERE stock_quantity > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_search 
ON products USING gin(to_tsvector('english', name || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_order 
ON order_items(product_id, order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_product 
ON cart_items(user_id, product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_product 
ON favorites(user_id, product_id);

-- Add function to validate order totals
CREATE OR REPLACE FUNCTION validate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_total decimal(10,2);
BEGIN
  -- Calculate total from order items
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO calculated_total
  FROM order_items
  WHERE order_id = NEW.id;
  
  -- Allow small rounding differences (up to 1 cent)
  IF ABS(calculated_total - NEW.total_amount) > 0.01 THEN
    RAISE EXCEPTION 'Order total mismatch. Calculated: %, Provided: %', calculated_total, NEW.total_amount;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order total validation
DROP TRIGGER IF EXISTS validate_order_total_trigger ON orders;
CREATE TRIGGER validate_order_total_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_total();

-- Add function to prevent negative stock
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stock_quantity < 0 THEN
    RAISE EXCEPTION 'Stock quantity cannot be negative. Product: %, Attempted quantity: %', NEW.id, NEW.stock_quantity;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for stock validation
DROP TRIGGER IF EXISTS prevent_negative_stock_trigger ON products;
CREATE TRIGGER prevent_negative_stock_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION prevent_negative_stock();