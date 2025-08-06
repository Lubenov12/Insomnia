/*
  # Product Variants Migration

  1. Create product_variants table
    - Each variant has a size and stock quantity
    - Foreign key relationship to products table
    - Proper indexing for performance

  2. Migrate existing data
    - Convert existing size columns to variant records
    - Preserve all existing stock data

  3. Update products table
    - Remove size-specific columns
    - Update stock_quantity to be calculated from variants
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity) WHERE stock_quantity > 0;

-- Enable Row Level Security
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Product variants policies (public read, admin write)
CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Product variants can be managed by authenticated users"
  ON product_variants FOR ALL
  TO authenticated
  USING (true);

-- Migrate existing size data to variants
INSERT INTO product_variants (product_id, size, stock_quantity)
SELECT 
  id as product_id,
  'S' as size,
  COALESCE(size_s_quantity, 0) as stock_quantity
FROM products
WHERE COALESCE(size_s_quantity, 0) > 0

UNION ALL

SELECT 
  id as product_id,
  'M' as size,
  COALESCE(size_m_quantity, 0) as stock_quantity
FROM products
WHERE COALESCE(size_m_quantity, 0) > 0

UNION ALL

SELECT 
  id as product_id,
  'L' as size,
  COALESCE(size_l_quantity, 0) as stock_quantity
FROM products
WHERE COALESCE(size_l_quantity, 0) > 0

UNION ALL

SELECT 
  id as product_id,
  'XL' as size,
  COALESCE(size_xl_quantity, 0) as stock_quantity
FROM products
WHERE COALESCE(size_xl_quantity, 0) > 0;

-- Create function to update product stock_quantity from variants
CREATE OR REPLACE FUNCTION update_product_stock_from_variants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the product's stock_quantity based on sum of all variants
  UPDATE products 
  SET stock_quantity = (
    SELECT COALESCE(SUM(stock_quantity), 0)
    FROM product_variants 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically update product stock when variants change
CREATE TRIGGER update_product_stock_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_from_variants();

-- Update existing products to have correct stock_quantity
UPDATE products 
SET stock_quantity = (
  SELECT COALESCE(SUM(stock_quantity), 0)
  FROM product_variants 
  WHERE product_id = products.id
);

-- Remove old size columns from products table
ALTER TABLE products 
DROP COLUMN IF EXISTS size_s_quantity,
DROP COLUMN IF EXISTS size_m_quantity,
DROP COLUMN IF EXISTS size_l_quantity,
DROP COLUMN IF EXISTS size_xl_quantity;

-- Create function to safely decrement variant stock
CREATE OR REPLACE FUNCTION decrement_variant_stock(product_id uuid, size text, quantity integer)
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
  FROM product_variants
  WHERE product_variants.product_id = decrement_variant_stock.product_id
    AND product_variants.size = decrement_variant_stock.size
  FOR UPDATE;
  
  -- Check if variant exists
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product variant not found for product % and size %', product_id, size;
  END IF;
  
  -- Calculate new stock
  new_stock := current_stock - quantity;
  
  -- Prevent negative stock
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for size %. Available: %, Requested: %', size, current_stock, quantity;
  END IF;
  
  -- Update stock
  UPDATE product_variants
  SET stock_quantity = new_stock,
      updated_at = now()
  WHERE product_variants.product_id = decrement_variant_stock.product_id
    AND product_variants.size = decrement_variant_stock.size;
  
  RETURN new_stock;
END;
$$; 