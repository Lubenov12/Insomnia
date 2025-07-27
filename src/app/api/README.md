# API Documentation

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

### POST /api/auth/login

Login with existing credentials.

### POST /api/auth/resend-verification

Resend email verification.

## Product Endpoints

### GET /api/products

Get all products with pagination.

### GET /api/products/[id]

Get specific product details.

## Cart Endpoints

### GET /api/cart

Get cart items.

### POST /api/cart

Add item to cart.

### GET /api/cart/[user_id]

Get user's cart.

## Favorites Endpoints

### GET /api/favorites

Get favorite items.

### POST /api/favorites

Add item to favorites.

### GET /api/favorites/[user_id]

Get user's favorites.

## Orders Endpoints

### GET /api/orders

Get all orders.

### POST /api/orders

Create new order.

### GET /api/orders/[user_id]

Get user's orders.

## Payment Endpoints

### POST /api/stripe

Process Stripe payment.

### POST /api/bolt

Process Bolt payment.

## Shipping Endpoints

### POST /api/shipping

Calculate shipping costs.

## Database Schema

### Tables

- `products` - Product information
- `users` - User profiles
- `orders` - Order records
- `order_items` - Order line items
- `favorites` - User favorites
- `cart_items` - Shopping cart items
