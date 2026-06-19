# Bracelet Ordering and Inventory Management System

A full-stack e-commerce platform for handmade jewelry built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**, and **Supabase**.

## Features

### Customer
- Browse products without login (category filter, search, pagination)
- Product detail modal with image gallery
- Shopping cart with stock validation
- Checkout with GCash payment and receipt upload
- Order tracking dashboard

### Admin
- Dashboard with sales analytics
- Product CRUD with image upload
- Inventory management
- Order management and payment verification
- Sales reports with CSV export
- GCash QR code settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## Project Structure

```
src/
├── actions/          # Server Actions (auth, cart, orders, products, settings)
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin dashboard pages (protected)
│   ├── auth/         # OAuth callback route
│   ├── cart/         # Shopping cart
│   ├── checkout/     # Checkout flow
│   ├── dashboard/    # Customer order tracking
│   ├── login/        # Authentication
│   └── register/
├── components/
│   ├── admin/        # Admin-specific components
│   ├── auth/         # Login/register forms
│   ├── cart/         # Cart components
│   ├── checkout/     # Checkout form
│   ├── layout/       # Navbar, footer
│   ├── orders/       # Order display
│   ├── products/     # Product cards, filters
│   └── ui/           # Shadcn UI primitives
├── lib/
│   ├── supabase/     # Supabase client utilities
│   ├── utils.ts      # Helpers (cn, formatCurrency)
│   └── validations.ts # Zod schemas
├── types/            # TypeScript type definitions
└── middleware.ts     # Auth + admin route protection

supabase/
├── schema.sql        # Database schema, RLS, triggers, seed data
└── storage.sql       # Storage bucket policies
```

## Installation

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create storage buckets in Dashboard → Storage:
   - `product-images` (public)
   - `payment-receipts` (private)
   - `gcash-qr` (public)
4. Run `supabase/storage.sql` in the SQL Editor
5. Enable Google OAuth in Authentication → Providers (optional)
6. Set Site URL to `http://localhost:3000` in Authentication → URL Configuration

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create an admin user

1. Register a new account via the app
2. In Supabase SQL Editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Order Flow

1. Customer browses products → adds to cart
2. Customer clicks Checkout → redirected to login if needed
3. Customer fills shipping details
4. System displays GCash QR code
5. Customer pays via GCash and uploads receipt
6. Order submitted → inventory deducted automatically
7. Status: **Pending Verification**
8. Admin reviews receipt → approves or rejects
9. Admin updates status through fulfillment
10. Customer tracks progress in dashboard

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with role (customer/admin) |
| `products` | Product catalog |
| `cart_items` | Shopping cart per user |
| `orders` | Order records with payment info |
| `order_items` | Line items per order |
| `app_settings` | Store configuration (GCash QR URL) |

## Security

- Row Level Security (RLS) on all tables
- Middleware protects `/checkout`, `/dashboard`, and `/admin/*`
- Admin routes require `role = 'admin'` in profiles
- Payment receipts stored in private bucket with signed URLs

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private project — all rights reserved.
