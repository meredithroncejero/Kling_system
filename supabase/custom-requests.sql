-- Custom request feature setup
-- Run this once in the Supabase SQL Editor for existing projects.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_request_status') THEN
    CREATE TYPE custom_request_status AS ENUM (
      'New Request',
      'Under Review',
      'Negotiating',
      'Approved',
      'Rejected',
      'Converted'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS custom_requests (
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

CREATE INDEX IF NOT EXISTS idx_custom_requests_user_id ON custom_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at);

DROP TRIGGER IF EXISTS custom_requests_updated_at ON custom_requests;
CREATE TRIGGER custom_requests_updated_at
  BEFORE UPDATE ON custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own custom requests" ON custom_requests;
CREATE POLICY "Users can view own custom requests"
  ON custom_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own custom requests" ON custom_requests;
CREATE POLICY "Users can create own custom requests"
  ON custom_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all custom requests" ON custom_requests;
CREATE POLICY "Admins can view all custom requests"
  ON custom_requests FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update custom requests" ON custom_requests;
CREATE POLICY "Admins can update custom requests"
  ON custom_requests FOR UPDATE
  USING (is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-request-references', 'custom-request-references', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload custom request references" ON storage.objects;
CREATE POLICY "Users upload custom request references"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'custom-request-references'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users read own custom request references" ON storage.objects;
CREATE POLICY "Users read own custom request references"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'custom-request-references'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
  );
