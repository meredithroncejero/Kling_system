-- Storage bucket setup and policies
-- Run after creating buckets in Supabase Dashboard

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('payment-receipts', 'payment-receipts', false),
  ('gcash-qr', 'gcash-qr', true)
ON CONFLICT (id) DO NOTHING;

-- Product images: public read, admin write
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());

-- Payment receipts: users upload own, admins read all
CREATE POLICY "Users upload payment receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users read own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
  );

-- GCash QR: public read, admin manage
CREATE POLICY "Public read gcash qr"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gcash-qr');

CREATE POLICY "Admin manage gcash qr"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gcash-qr' AND is_admin());

CREATE POLICY "Admin update gcash qr"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gcash-qr' AND is_admin());

CREATE POLICY "Admin delete gcash qr"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gcash-qr' AND is_admin());
