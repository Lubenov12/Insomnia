-- Add size availability columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size_s_quantity INTEGER DEFAULT 0 CHECK (size_s_quantity >= 0),
ADD COLUMN IF NOT EXISTS size_m_quantity INTEGER DEFAULT 0 CHECK (size_m_quantity >= 0),
ADD COLUMN IF NOT EXISTS size_l_quantity INTEGER DEFAULT 0 CHECK (size_l_quantity >= 0),
ADD COLUMN IF NOT EXISTS size_xl_quantity INTEGER DEFAULT 0 CHECK (size_xl_quantity >= 0);

-- Update existing products to have some stock in sizes
UPDATE products 
SET 
    size_s_quantity = GREATEST(1, FLOOR(stock_quantity * 0.25)),
    size_m_quantity = GREATEST(1, FLOOR(stock_quantity * 0.3)),
    size_l_quantity = GREATEST(1, FLOOR(stock_quantity * 0.25)),
    size_xl_quantity = GREATEST(1, FLOOR(stock_quantity * 0.2))
WHERE size_s_quantity = 0 AND size_m_quantity = 0 AND size_l_quantity = 0 AND size_xl_quantity = 0; 