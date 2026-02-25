-- 1. Add explicit DENY SELECT policy on leads table
CREATE POLICY "Deny all selects"
ON public.leads
FOR SELECT
TO public, anon, authenticated
USING (false);

-- 2. Make brand-files bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'brand-files';