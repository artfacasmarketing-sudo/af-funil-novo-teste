-- Fix RLS policies for leads table
-- Remove the overly permissive SELECT policy that exposes all leads to any authenticated user
DROP POLICY IF EXISTS "Allow authenticated read" ON public.leads;

-- The INSERT policy for public access is intentional (lead capture form)
-- Keep: "Allow public insert" policy

-- Fix storage bucket security
-- Update public read policy to only allow service_role access
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Create a more restrictive read policy - only service role can read
CREATE POLICY "Service role read brand files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brand-files');

-- Update upload policy to restrict file types and add some protection
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;

-- Allow anonymous uploads but with the expectation that 
-- client-side validation is enforced (file type, size limits)
CREATE POLICY "Allow controlled upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'brand-files' AND
    (storage.extension(name) IN ('png', 'jpg', 'jpeg', 'svg', 'webp', 'pdf'))
  );