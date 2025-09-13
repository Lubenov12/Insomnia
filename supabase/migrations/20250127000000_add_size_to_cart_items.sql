-- Add size column to cart_items table
-- This migration adds the missing size column to support product variants in cart

-- Step 1: Add size column to cart_items table
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS size text CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'));

-- Step 2: Update the unique constraint to include size
-- First drop the existing unique constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Add new unique constraint that includes size
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_user_id_product_id_size_key 
UNIQUE(user_id, product_id, size);

-- Step 3: Update existing cart items to have a default size
-- Set default size to 'M' for existing items without size
UPDATE cart_items 
SET size = 'M' 
WHERE size IS NULL;

-- Step 4: Make size column NOT NULL after setting defaults
ALTER TABLE cart_items 
ALTER COLUMN size SET NOT NULL;

-- Step 5: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_size ON cart_items(size);
