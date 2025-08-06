-- Simple Product Variants Migration - Step by Step

-- Step 1: Create the product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Step 2: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);

-- Step 3: Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies
CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Product variants can be managed by authenticated users"
  ON product_variants FOR ALL
  TO authenticated
  USING (true);

-- Step 5: Add variants for existing products
-- This creates variants with equal distribution of stock across sizes
INSERT INTO product_variants (product_id, size, stock_quantity)
SELECT 
  id as product_id,
  'S' as size,
  GREATEST(1, FLOOR(stock_quantity / 4)) as stock_quantity
FROM products
WHERE stock_quantity > 0

UNION ALL

SELECT 
  id as product_id,
  'M' as size,
  GREATEST(1, FLOOR(stock_quantity / 4)) as stock_quantity
FROM products
WHERE stock_quantity > 0

UNION ALL

SELECT 
  id as product_id,
  'L' as size,
  GREATEST(1, FLOOR(stock_quantity / 4)) as stock_quantity
FROM products
WHERE stock_quantity > 0

UNION ALL

SELECT 
  id as product_id,
  'XL' as size,
  GREATEST(1, FLOOR(stock_quantity / 4)) as stock_quantity
FROM products
WHERE stock_quantity > 0; 