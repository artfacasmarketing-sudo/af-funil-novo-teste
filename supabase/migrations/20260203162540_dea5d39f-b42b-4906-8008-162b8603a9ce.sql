-- Tabela para armazenar leads do funil
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Dados de contato
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  company TEXT,
  
  -- Respostas do funil
  goal TEXT,
  occasion TEXT,
  audience TEXT,
  niche TEXT,
  quantity_range TEXT,
  budget_range TEXT,
  deadline_range TEXT,
  categories TEXT[],
  path_chosen TEXT,
  
  -- Cores
  brand_colors BOOLEAN DEFAULT FALSE,
  selected_colors TEXT[],
  color_codes TEXT,
  
  -- Arquivos (URLs do Storage)
  file_urls TEXT[],
  
  -- Extras
  must_have TEXT,
  
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  page_url TEXT,
  
  -- Status do webhook
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_sent_at TIMESTAMPTZ
);

-- RLS: Inserção publica (anon), leitura apenas autenticado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.leads
  FOR SELECT TO authenticated USING (true);

-- Bucket para arquivos de marca (logos, manuais, etc)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-files', 'brand-files', true);

-- RLS: Upload e leitura publicos
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'brand-files');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'brand-files');