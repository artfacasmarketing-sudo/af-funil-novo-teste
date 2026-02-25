
ALTER TABLE public.leads
ADD COLUMN document_type text NULL,
ADD COLUMN document_number text NULL,
ADD COLUMN state_registration text NULL;
