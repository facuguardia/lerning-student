-- Create contact_requests table and RLS policies

-- Ensure helper function exists (optional safety). If already defined, this replaces it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Table: public.contact_requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);

-- Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow anyone (anon or authenticated) to insert contact messages
CREATE POLICY contact_requests_insert_public
ON public.contact_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admin to perform all actions (read, update, delete)
CREATE POLICY contact_requests_admin_all
ON public.contact_requests
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

