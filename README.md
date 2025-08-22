# 🛍️ Insomnia - Modern E-Commerce Platform

A full-featured e-commerce website built with Next.js, featuring product management, shopping cart, secure payments with Stripe, and an admin panel for inventory management.

![Insomnia E-Commerce](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Testing the Application](#-testing-the-application)
- [Admin Panel](#-admin-panel)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🛒 Customer Features

- **Product Catalog**: Browse products with filtering and search
- **Shopping Cart**: Add/remove items with size selection
- **Secure Checkout**: Stripe-powered payment processing
- **User Authentication**: Email verification system
- **Order Tracking**: View order history and status
- **Responsive Design**: Mobile-first approach

### 🔧 Admin Features

- **Product Management**: Create, edit, and delete products
- **Inventory Control**: Manage stock quantities by size
- **Order Management**: View and process orders
- **Secure Admin Panel**: Database-based authentication
- **Stock Alerts**: Real-time inventory tracking

### 💳 Payment Features

- **Stripe Integration**: Secure payment processing
- **Multiple Payment Methods**: Cards, digital wallets
- **3D Secure**: Enhanced security authentication
- **Test Mode**: Comprehensive testing environment

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **React Hook Form** - Form handling

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Stripe** - Payment processing
- **NextAuth.js** - Authentication system

### Database

- **PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Data protection
- **Real-time subscriptions** - Live updates

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**
- **Git**

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd Insomnia
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
This can be shown only with the required tokens which I can't show in here
```

### Getting API Keys

1. **Supabase**:

   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and API keys from Settings > API

2. **Stripe**:
   - Create an account at [stripe.com](https://stripe.com)
   - Get your test keys from Dashboard > Developers > API keys

## 🗄️ Database Setup

1. **Run database migrations**

   ```bash
   npx supabase db push
   ```

2. **Set up admin user** (optional script)

   ```bash
   node scripts/setup-admin.js
   ```

3. **Verify database tables**
   - `products` - Product catalog
   - `product_variants` - Size and stock information
   - `orders` - Customer orders
   - `order_items` - Order line items
   - `admin_users` - Admin authentication
   - `admin_sessions` - Admin sessions

## 🏃‍♂️ Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Verify the application**
   - Homepage loads with products
   - Navigation works
   - No console errors

## 🧪 Testing the Application

### Customer Journey Testing

1. **Browse Products**

   - Visit `/clothes` to see the product catalog
   - Test product filtering and search
   - Click on products to view details

2. **Shopping Cart**

   - Add products to cart with different sizes
   - Modify quantities
   - Remove items
   - View cart total

3. **Checkout Process**
   - Proceed to checkout
   - Fill in shipping information
   - Use test payment cards (see [STRIPE_TEST_CARDS.md](./STRIPE_TEST_CARDS.md))

### Test Payment Cards

Use these test cards for payment testing:

| Scenario         | Card Number           | Result              |
| ---------------- | --------------------- | ------------------- |
| **Success**      | `4242 4242 4242 4242` | ✅ Payment succeeds |
| **Decline**      | `4000 0000 0000 0002` | ❌ Generic decline  |
| **3D Secure**    | `4000 0025 0000 3155` | 🔄 Requires auth    |
| **Insufficient** | `4000 0000 0000 9995` | ❌ No funds         |

## 🔌 API Endpoints

### Public APIs

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/cart` - Add to cart
- `POST /api/stripe` - Create payment intent
- `POST /api/shipping` - Calculate shipping

### Admin APIs

- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/products` - Get products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/stock` - Update stock

### Authentication APIs

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-verification` - Resend verification

## 📁 Project Structure

```
Insomnia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── auth/              # Authentication pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout process
│   │   ├── clothes/           # Product catalog
│   │   ├── product/           # Product details
│   │   └── components/        # Shared components
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utility libraries
├── supabase/                  # Database migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

### Key Files

- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Homepage
- `src/contexts/ProductContext.tsx` - Product state management
- `src/lib/supabase.ts` - Database client
- `src/lib/stripe.ts` - Payment processing
- `src/middleware.ts` - Route protection

## 🎨 Customization

### Styling

- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Admin styles in `src/app/admin/admin-styles.css`

### Adding Products

1. Use admin panel at `/admin/products`
2. Or insert directly into database
3. Images stored in `public/img/`

### Payment Configuration

- Update Stripe keys in environment variables
- Configure webhooks in Stripe dashboard
- Test with provided test cards

### Debug Mode

Enable debug logging:

```env
DEBUG=true
NODE_ENV=development
```

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Test thoroughly before submitting

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing framework
- [Supabase](https://supabase.com) for the database solution
- [Stripe](https://stripe.com) for payment processing
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Shadcn/ui](https://ui.shadcn.com) for UI components

---
