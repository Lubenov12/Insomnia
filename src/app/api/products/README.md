# Products API Optimization Guide

## Database Indexes for Optimal Performance

To ensure fast query performance, create the following indexes in your Supabase database:

### 1. Products Table Indexes

```sql
-- Primary index for stock filtering and ordering
CREATE INDEX idx_products_stock_created ON products(stock_quantity, created_at DESC);

-- Index for category filtering
CREATE INDEX idx_products_category ON products(category);

-- Index for name search
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));

-- Composite index for category + stock filtering
CREATE INDEX idx_products_category_stock ON products(category, stock_quantity);

-- Index for price range queries (if needed)
CREATE INDEX idx_products_price ON products(price);
```

### 2. Product Variants Table Indexes

```sql
-- Index for product variants by product_id
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Index for stock quantity in variants
CREATE INDEX idx_product_variants_stock ON product_variants(stock_quantity);
```

## Query Optimization Features

### ✅ Implemented Optimizations

1. **Selective Field Fetching**: Only fetch necessary fields (`id, name, price, image_url, category, stock_quantity`)
2. **Pagination**: Use `limit` and `offset` for efficient data loading
3. **Client-Side Caching**: 5-minute cache duration with automatic cleanup
4. **Infinite Scroll**: Load more products as user scrolls
5. **Error Boundaries**: Graceful error handling with retry functionality
6. **Loading States**: Skeleton components for better UX
7. **React Suspense**: Better loading state management

### 🚀 Performance Benefits

- **Reduced Data Transfer**: Only essential fields are fetched
- **Faster Initial Load**: Cached responses for repeated requests
- **Smooth Scrolling**: Infinite scroll with intersection observer
- **Better UX**: Loading skeletons and error recovery
- **Optimized Queries**: Efficient database indexes and query structure

### 📊 Monitoring

Monitor these metrics for optimal performance:

- **Query Response Time**: Should be < 200ms for cached requests
- **Cache Hit Rate**: Aim for > 80% cache hit rate
- **Database Load**: Monitor connection pool usage
- **Memory Usage**: Cache size should stay under 100 entries

### 🔧 Configuration

The API supports these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)
- `category`: Filter by category
- `search`: Search in product names

Example: `/api/products?page=1&limit=12&category=shirts&search=blue`
