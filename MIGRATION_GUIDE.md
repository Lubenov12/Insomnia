# Database Migration Guide: Product Variants

## Overview

This migration converts the product size system from individual columns to a separate `product_variants` table for better stock tracking per size.

## Step 1: Apply the Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the entire content of `supabase/migrations/20250726092000_product_variants.sql`
5. Click **Run** to execute the migration

## Step 2: Verify the Migration

After running the migration, verify these changes:

### Check Tables

```sql
-- Check if product_variants table exists
SELECT * FROM product_variants LIMIT 5;

-- Check if old size columns were removed
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name LIKE 'size_%';
```

### Check Data Migration

```sql
-- Verify that existing products have variants
SELECT p.name, pv.size, pv.stock_quantity
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
LIMIT 10;
```

## Step 3: Re-enable Variant Features

After the migration is applied, you need to re-enable the variant features in the code:

### 1. Update Products API (`src/app/api/products/route.ts`)

Replace line 72 with:

```typescript
"id, name, description, price, image_url, stock_quantity, created_at, product_variants(id, size, stock_quantity)",
```

### 2. Update Product Details API (`src/app/api/products/[id]/route.ts`)

Replace the temporary code with:

```typescript
// Fetch product variants
const { data: variants, error: variantsError } = await supabase
  .from("product_variants")
  .select("id, size, stock_quantity, created_at, updated_at")
  .eq("product_id", id)
  .order("size");

if (variantsError) {
  throw new DatabaseError(
    "Failed to fetch product variants",
    variantsError.code,
    variantsError
  );
}

// Create size availability object from variants
const sizeAvailability: { [key: string]: number } = {};
variants?.forEach((variant) => {
  sizeAvailability[variant.size] = variant.stock_quantity;
});

// Add variants and size availability to product
const productWithVariants = {
  ...product,
  variants: variants || [],
  size_availability: sizeAvailability,
};

return NextResponse.json(productWithVariants);
```

### 3. Update Cart API (`src/app/api/cart/route.ts`)

Replace the TODO comment with:

```typescript
// Check if product variant exists and has sufficient stock
const { data: variant, error: variantError } = await supabase
  .from("product_variants")
  .select("stock_quantity")
  .eq("product_id", validatedData.product_id)
  .eq("size", validatedData.size)
  .single();

if (variantError || !variant) {
  return NextResponse.json(
    { error: "Product variant not found" },
    { status: 404 }
  );
}

if (variant.stock_quantity < validatedData.quantity) {
  return NextResponse.json(
    { error: "Insufficient stock for selected size" },
    { status: 400 }
  );
}
```

## Step 4: Test the Application

1. Restart your development server
2. Visit your application
3. Check that products load without errors
4. Test the product detail pages
5. Test adding items to cart

## Troubleshooting

### If you get "table product_variants does not exist" error:

- Make sure you ran the migration SQL in Supabase
- Check that the migration file was executed completely

### If products show 0 stock for all sizes:

- The migration should have populated variants from existing size columns
- Check if the migration data insertion worked correctly

### If the API still returns 500 errors:

- Check the browser console and server logs for specific error messages
- Make sure all the code changes have been applied

## Migration Benefits

After this migration:

- ✅ Each product size has its own stock tracking
- ✅ Easy to add new sizes (XS, XXL, 3XL, etc.)
- ✅ Better data integrity with foreign key constraints
- ✅ Improved performance with proper indexing
- ✅ Scalable for future variant types (color, material, etc.)
