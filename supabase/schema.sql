-- Bracelet Ordering and Inventory Management System
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_category AS ENUM ('Bracelet', 'Charm', 'Keychain', 'Necklace');
CREATE TYPE custom_request_status AS ENUM (
  'New Request',
  'Under Review',
  'Negotiating',
  'Approved',
  'Rejected',
  'Converted'
);
CREATE TYPE order_status AS ENUM (
  'Pending Verification',
  'Payment Verified',
  'Processing',
  'Shipped',
  'Completed',
  'Cancelled',
  'Rejected'
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  email TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category product_category NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status order_status NOT NULL DEFAULT 'Pending Verification',
  payment_receipt_url TEXT,
  shipping_address TEXT NOT NULL,
  delivery_notes TEXT NOT NULL DEFAULT '',
  contact_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

-- App settings (GCash QR code)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom order requests
CREATE TABLE custom_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category product_category NOT NULL,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  landmark TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_image_path TEXT,
  status custom_request_status NOT NULL DEFAULT 'New Request',
  negotiated_price DECIMAL(10, 2) CHECK (negotiated_price IS NULL OR negotiated_price >= 0),
  admin_notes TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_custom_requests_user_id ON custom_requests(user_id);
CREATE INDEX idx_custom_requests_status ON custom_requests(status);
CREATE INDEX idx_custom_requests_created_at ON custom_requests(created_at);

-- Updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER custom_requests_updated_at
  BEFORE UPDATE ON custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Deduct stock on order submission
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  current_stock INTEGER;
BEGIN
  FOR item IN
    SELECT product_id, quantity FROM order_items WHERE order_id = NEW.id
  LOOP
    SELECT stock INTO current_stock FROM products WHERE id = item.product_id FOR UPDATE;
    IF current_stock < item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item.product_id;
    END IF;
    UPDATE products SET stock = stock - item.quantity WHERE id = item.product_id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created_deduct_stock
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_inventory_on_order();

-- Restore stock when order is cancelled or rejected
CREATE OR REPLACE FUNCTION restore_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status IN ('Cancelled', 'Rejected') AND OLD.status NOT IN ('Cancelled', 'Rejected') THEN
    FOR item IN
      SELECT product_id, quantity FROM order_items WHERE order_id = NEW.id
    LOOP
      UPDATE products SET stock = stock + item.quantity WHERE id = item.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_cancelled_restore_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_inventory_on_cancel();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- Cart items policies
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- App settings policies
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app settings"
  ON app_settings FOR ALL
  USING (is_admin());

-- Custom request policies
CREATE POLICY "Users can view own custom requests"
  ON custom_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom requests"
  ON custom_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all custom requests"
  ON custom_requests FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update custom requests"
  ON custom_requests FOR UPDATE
  USING (is_admin());

-- Storage buckets (run in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('product-images', 'product-images', true),
--   ('payment-receipts', 'payment-receipts', false),
--   ('gcash-qr', 'gcash-qr', true),
--   ('custom-request-references', 'custom-request-references', false);

-- Storage policies
-- CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');

-- CREATE POLICY "Admin upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- CREATE POLICY "Users upload payment receipts"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users read own receipts"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'payment-receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin()));

-- CREATE POLICY "Public read gcash qr"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'gcash-qr');

-- CREATE POLICY "Admin manage gcash qr"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'gcash-qr' AND is_admin());

-- Seed data
INSERT INTO app_settings (key, value) VALUES ('gcash_qr_url', '');

INSERT INTO products (name, category, description, price, stock, image_url) VALUES
  ('Rose Gold Charm Bracelet', 'Bracelet', 'Elegant rose gold bracelet with delicate charms. Perfect for everyday wear.', 599.00, 25, NULL),
  ('Pearl Strand Necklace', 'Necklace', 'Classic freshwater pearl necklace with sterling silver clasp.', 899.00, 15, NULL),
  ('Heart Pendant Charm', 'Charm', 'Sterling silver heart charm, compatible with all our bracelet collections.', 299.00, 40, NULL),
  ('Leather Keychain', 'Keychain', 'Handcrafted leather keychain with gold-plated hardware.', 199.00, 30, NULL),
  ('Crystal Bead Bracelet', 'Bracelet', 'Hand-strung crystal beads in soft pastel tones.', 449.00, 20, NULL),
  ('Star Charm', 'Charm', 'Dainty star-shaped charm in 18k gold plating.', 249.00, 0, NULL),
  ('Layered Chain Necklace', 'Necklace', 'Trendy layered chain necklace set in gold finish.', 749.00, 12, NULL),
  ('Monogram Keychain', 'Keychain', 'Personalized monogram keychain with tassel detail.', 349.00, 18, NULL);

-- To create an admin user, after signing up run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
