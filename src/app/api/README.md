# E-commerce API Documentation

This backend system provides a complete REST API for an e-commerce clothing website built with Next.js and Supabase (PostgreSQL).

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## API Endpoints

### Products

#### GET /api/products
Get all products with optional filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by product category
- `search` (optional): Search in product name and description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/products/[id]
Get a single product by ID.

#### POST /api/products
Create a new product (requires authentication).

**Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "image_url": "https://example.com/image.jpg",
  "category": "shirts",
  "stock_quantity": 100
}
```

### Authentication

#### POST /api/auth/register
Register a new user account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Main St",
  "phone_number": "+1234567890"
}
```

#### POST /api/auth/login
Login with email and password.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {...},
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

### Cart Management

#### POST /api/cart
Add item to cart (requires authentication).

**Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

#### GET /api/cart/[user_id]
Get cart items for a user (requires authentication).

**Response:**
```json
{
  "items": [...],
  "totalAmount": 59.98,
  "itemCount": 2
}
```

### Orders

#### POST /api/orders
Create a new order (requires authentication).

**Body:**
```json
{
  "payment_method": "card",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

#### GET /api/orders/[user_id]
Get orders for a user (requires authentication).

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number
- `limit` (optional): Items per page

### Favorites

#### POST /api/favorites
Add product to favorites (requires authentication).

**Body:**
```json
{
  "product_id": "uuid"
}
```

#### GET /api/favorites/[user_id]
Get user's favorite products (requires authentication).

## Database Schema

### Tables

1. **products**: Product catalog
2. **users**: User profiles (extends Supabase auth.users)
3. **orders**: Order management
4. **order_items**: Items within orders
5. **favorites**: User wishlist
6. **cart_items**: Shopping cart persistence

### Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Foreign key constraints enforce data integrity
- Input validation using Zod schemas
- Secure password hashing via Supabase Auth

### Performance Optimizations

- Database indexes on frequently queried columns
- Pagination support for large datasets
- Efficient JOIN queries for related data
- Stock management with atomic operations

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [...] // For validation errors
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate data)
- 500: Internal Server Error

## Frontend Integration

To use this API in your Next.js frontend:

```javascript
// Example: Fetch products
const response = await fetch('/api/products?category=shirts&page=1');
const data = await response.json();

// Example: Add to cart (with authentication)
const response = await fetch('/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    product_id: 'product-uuid',
    quantity: 1
  })
});
```

## Setup Instructions

1. Set up Supabase project and get your credentials
2. Add environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. Run database migrations
4. Start the development server: `npm run dev`

The API will be available at `http://localhost:3000/api/`