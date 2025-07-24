/*
  # Add Stock Management Function

  1. Functions
    - `decrement_stock` - Safely decrements product stock quantity
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
$$;