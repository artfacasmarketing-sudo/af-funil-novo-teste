
-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sku text NOT NULL,
  image_url text NOT NULL,
  price_min numeric NOT NULL,
  price_max numeric NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);

-- Block all writes via RLS (admin uses service_role_key)
CREATE POLICY "No public insert"
  ON public.products FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No public update"
  ON public.products FOR UPDATE
  USING (false);

CREATE POLICY "No public delete"
  ON public.products FOR DELETE
  USING (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Product images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow product image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow product image updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow product image deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- Seed existing products
INSERT INTO public.products (name, sku, image_url, price_min, price_max, categories, sort_order) VALUES
  ('Bloco de Anotações C/ Aba Superior', 'bloco-de-notas-c-aba-superior', 'https://artfacas.com/conteudo/uploads/2025/08/003-300x300.webp', 12.36, 12.36, ARRAY['cadernos'], 1),
  ('Caderneta Moleskine', 'caderneta-moleskine', 'https://artfacas.com/conteudo/uploads/2025/08/16-1-300x300.webp', 13.48, 13.48, ARRAY['cadernos'], 2),
  ('Caderno Capa Dura', 'caderno-capa-dura-14x21', 'https://artfacas.com/conteudo/uploads/2025/09/CADERNO-18X25-AZUL-300x300.webp', 27.00, 48.00, ARRAY['cadernos'], 3),
  ('Caderno Criative', 'caderno-criative', 'https://artfacas.com/conteudo/uploads/2025/10/CADERNO-CRIATIVE-PRETO-300x300.webp', 32.73, 32.73, ARRAY['cadernos'], 4),
  ('Caderno Executive', 'caderno-executive', 'https://artfacas.com/conteudo/uploads/2025/08/25-1-300x300.webp', 45.38, 45.38, ARRAY['cadernos'], 5),
  ('Caderno Sport Jeans', 'caderno-sport-jeans', 'https://artfacas.com/conteudo/uploads/2025/08/29-1-300x300.webp', 32.73, 32.73, ARRAY['cadernos'], 6),
  ('Lampião Led', '10954', 'https://artfacas.com/conteudo/uploads/2025/10/LAMPIAO-LED-300x300.webp', 94.88, 94.88, ARRAY['camping'], 7),
  ('Canivete Forest', '10334', 'https://artfacas.com/conteudo/uploads/2025/08/05-1-300x300.webp', 49.28, 49.28, ARRAY['canivetes'], 8),
  ('Canivete AF-14', '11238', 'https://artfacas.com/conteudo/uploads/2025/08/06-1-300x300.webp', 75.90, 75.90, ARRAY['canivetes'], 9),
  ('Canivete Farm', '10333', 'https://artfacas.com/conteudo/uploads/2025/08/07-1-300x300.webp', 73.92, 73.92, ARRAY['canivetes'], 10),
  ('Canivete Hunter', '11148', 'https://artfacas.com/conteudo/uploads/2025/08/02-5-300x300.webp', 79.20, 79.20, ARRAY['canivetes'], 11),
  ('Chapéu Fibra de Bambu', 'chapeu-fibra-de-bambu', 'https://artfacas.com/conteudo/uploads/2025/09/CHAPEU-AZUL-300x300.webp', 50.00, 50.00, ARRAY['chapeus'], 12),
  ('Caneca de Chopp 430 ML', 'caneca-de-chopp-430-ml', 'https://artfacas.com/conteudo/uploads/2025/10/CANECA-DE-CHOPP-430ML-VERDE-300x300.webp', 69.30, 69.30, ARRAY['copos'], 13),
  ('Copo Térmico Inox 270 ML', 'copo-de-inox-termico-270-ml', 'https://artfacas.com/conteudo/uploads/2025/10/COPO-DE-INOX-TERMICO-270ML-LARANJA-300x300.webp', 74.25, 74.25, ARRAY['copos'], 14),
  ('Copo Térmico C/ Abridor', 'copo-termico-c-abridor', 'https://artfacas.com/conteudo/uploads/2025/08/02-300x300.webp', 77.22, 77.22, ARRAY['copos'], 15),
  ('Copo Térmico C/ Tampa 510ML', 'copo-termico-c-tampa-510ml', 'https://artfacas.com/conteudo/uploads/2025/08/15-300x300.webp', 70.40, 70.40, ARRAY['copos'], 16),
  ('Copo Térmico Dupla Camada 250 ML', 'copo-de-plastico-250ml', 'https://artfacas.com/conteudo/uploads/2025/08/10-300x300.webp', 42.90, 42.90, ARRAY['copos'], 17),
  ('Faca 08 C/ Anel', 'faca-08-c-anel', 'https://artfacas.com/conteudo/uploads/2025/08/14-1-300x300.webp', 195.00, 298.00, ARRAY['facas'], 18),
  ('Facas 08 Madeira', 'faca-08-c-anel-copia', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-BOI-MADEIRA-CAIXA-300x300.webp', 220.22, 425.00, ARRAY['facas'], 19),
  ('Facas 08 Osso', 'facas-08-osso', 'https://artfacas.com/conteudo/uploads/2025/10/FACA-08AG-OSSO-BAINHA-300x300.webp', 181.50, 410.00, ARRAY['facas'], 20),
  ('Kit Churrasco 4 Pç.', 'kit-bambu-4pc', 'https://artfacas.com/conteudo/uploads/2025/11/KIT-BAMBU-4PC-300x300.webp', 235.00, 235.00, ARRAY['facas','kits'], 21),
  ('Squeeze Aquarela 500ML', 'squeeze-aquarela-500ml', 'https://artfacas.com/conteudo/uploads/2025/10/SQUEEZE-AQUARELA-500ML-VERMELHO-300x300.webp', 27.83, 27.83, ARRAY['garrafas'], 22),
  ('Squeeze Tampa Bambu 500ML', 'squeeze-tampa-bambu-500ml', 'https://artfacas.com/conteudo/uploads/2025/10/SQUEEZE-TAMPA-BAMBU-500ML-ROSA-300x300.webp', 27.83, 27.83, ARRAY['garrafas'], 23),
  ('Kit Churrasco em Bambu 4 Peças', '11058', 'https://artfacas.com/conteudo/uploads/2025/10/uias-300x300.webp', 118.80, 118.80, ARRAY['kits'], 24),
  ('Kit Churrasco BBQ 3119', '10933', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-CHURRASCO-BBQ-3119-300x300.webp', 195.82, 195.82, ARRAY['kits'], 25),
  ('Kit Corporativo', 'kits-corporativos', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-CORPORATIVO-ROSA-300x300.webp', 160.15, 160.15, ARRAY['kits'], 26),
  ('Kit Queijo 2 Peças Ovalado', '10705', 'https://artfacas.com/conteudo/uploads/2025/10/asq-300x300.webp', 115.50, 115.50, ARRAY['kits'], 27),
  ('Kit Queijo 3 Peças Ovalado', '10707', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-3-PECAS-OVALADA-300x300.webp', 115.50, 115.50, ARRAY['kits'], 28),
  ('Kit Queijo 3120', '10950', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-3120-300x300.webp', 132.00, 132.00, ARRAY['kits'], 29),
  ('Kit Queijo Quadrado', '10712', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-QUADRADO-300x300.webp', 148.50, 148.50, ARRAY['kits'], 30),
  ('Kit Start', 'kit-start', 'https://artfacas.com/conteudo/uploads/2025/08/07-4-300x300.webp', 82.90, 82.90, ARRAY['kits'], 31),
  ('Kit Vinho 4 Peças Porta Garrafa', '10722', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-VINHO-4-PECAS-300x300.webp', 154.00, 154.00, ARRAY['kits'], 32),
  ('Kit Vinho 5 Peças Bambu', '10721', 'https://artfacas.com/conteudo/uploads/2025/10/KIT-VINHO-5-PECAS-300x300.webp', 118.80, 118.80, ARRAY['kits'], 33),
  ('Maleta 08G - CH', '10743', 'https://artfacas.com/conteudo/uploads/2025/10/MALETA-08G-CH-300x300.webp', 72.60, 72.60, ARRAY['kits'], 34),
  ('Maleta 08AG - CH', '10741', 'https://artfacas.com/conteudo/uploads/2025/10/MALETA-08AG-CH-300x300.webp', 87.38, 87.38, ARRAY['kits'], 35),
  ('Cachaça 2 Copos', '10679', 'https://artfacas.com/conteudo/uploads/2025/10/cachaca-300x300.webp', 350.00, 350.00, ARRAY['kits'], 36),
  ('Mochila De Lona', 'mochila-de-lona', 'https://artfacas.com/conteudo/uploads/2025/10/06-300x300.webp', 209.00, 209.00, ARRAY['mochilas'], 37),
  ('Mochila PAG', 'mochila-pag', 'https://artfacas.com/conteudo/uploads/2025/10/10-300x300.webp', 158.40, 158.40, ARRAY['mochilas'], 38);
