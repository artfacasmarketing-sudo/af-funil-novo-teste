import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  price_min: number;
  price_max: number;
  categories: string[];
  colors?: string[];
  color_images?: Record<string, string>;
  color_skus?: Record<string, string>;
}

export const products: Product[] = [
  // Cadernos
  {
    id: 'bloco-anotacoes-aba-superior',
    name: 'Bloco de Anotações C/ Aba Superior',
    sku: 'bloco-de-notas-c-aba-superior',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/003-300x300.webp',
    price_min: 12.36,
    price_max: 12.36,
    categories: ['cadernos'],
  },
  {
    id: 'caderneta-moleskine',
    name: 'Caderneta Moleskine',
    sku: 'caderneta-moleskine',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/16-1-300x300.webp',
    price_min: 13.48,
    price_max: 13.48,
    categories: ['cadernos'],
  },
  {
    id: 'caderno-capa-dura',
    name: 'Caderno Capa Dura',
    sku: 'caderno-capa-dura-14x21',
    image: 'https://artfacas.com/conteudo/uploads/2025/09/CADERNO-18X25-AZUL-300x300.webp',
    price_min: 27.00,
    price_max: 48.00,
    categories: ['cadernos'],
  },
  {
    id: 'caderno-criative',
    name: 'Caderno Criative',
    sku: 'caderno-criative',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CADERNO-CRIATIVE-PRETO-300x300.webp',
    price_min: 32.73,
    price_max: 32.73,
    categories: ['cadernos'],
  },
  {
    id: 'caderno-executive',
    name: 'Caderno Executive',
    sku: 'caderno-executive',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/25-1-300x300.webp',
    price_min: 45.38,
    price_max: 45.38,
    categories: ['cadernos'],
  },
  {
    id: 'caderno-sport-jeans',
    name: 'Caderno Sport Jeans',
    sku: 'caderno-sport-jeans',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/29-1-300x300.webp',
    price_min: 32.73,
    price_max: 32.73,
    categories: ['cadernos'],
  },

  // Camping
  {
    id: 'colete-puffer',
    name: 'Colete Puffer',
    sku: 'colete-puffer',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/WET-1-300x300.webp',
    price_min: 210.00,
    price_max: 210.00,
    categories: ['camping'],
  },
  {
    id: 'lampiao-led',
    name: 'Lampião Led',
    sku: '10954',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/LAMPIAO-LED-300x300.webp',
    price_min: 94.88,
    price_max: 94.88,
    categories: ['camping'],
  },

  // Canivetes
  {
    id: 'canivete-forest',
    name: 'Canivete Forest',
    sku: '10334',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/05-1-300x300.webp',
    price_min: 49.28,
    price_max: 49.28,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-af-14',
    name: 'Canivete AF-14',
    sku: '11238',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/06-1-300x300.webp',
    price_min: 75.90,
    price_max: 75.90,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-farm',
    name: 'Canivete Farm',
    sku: '10333',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/07-1-300x300.webp',
    price_min: 73.92,
    price_max: 73.92,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-hunter',
    name: 'Canivete Hunter',
    sku: '11148',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/02-5-300x300.webp',
    price_min: 79.20,
    price_max: 79.20,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-hunter-preto',
    name: 'Canivete Hunter Preto',
    sku: 'canivete-hunter-preto',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/01-1-300x300.webp',
    price_min: 79.20,
    price_max: 79.20,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-pica-fumo',
    name: 'Canivete Pica Fumo',
    sku: 'canivete-pica-fumo',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CANIVETE-PICA-FUMO-300x300.webp',
    price_min: 85.00,
    price_max: 85.00,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-premium',
    name: 'Canivete Premium',
    sku: 'canivete-premium',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CANIVETE-PREMIUM-S-ABRIDOR-webp-300x300.webp',
    price_min: 54.56,
    price_max: 54.56,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-premium-abridor',
    name: 'Canivete Premium C/ Abridor',
    sku: 'canivete-premium-c-abridor',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CANIVETE-PREMIUM-C-ABRIDOR-webp-300x300.webp',
    price_min: 54.56,
    price_max: 54.56,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-premium-abridor-madeirado',
    name: 'Canivete Premium C/ Abridor Cabo Madeirado',
    sku: 'canivete-premium-c-abridor-cabo-madeirado',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/cabo-madeira-com-abridor-madeira-300x300.webp',
    price_min: 75.08,
    price_max: 75.08,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-premium-sem-abridor-madeirado',
    name: 'Canivete Premium Sem Abridor Cabo Madeirado',
    sku: 'canivete-premium-sem-abridor-cabo-madeirado',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/canivete-premium-sem-abridor-madeira-300x300.webp',
    price_min: 75.08,
    price_max: 75.08,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-sport',
    name: 'Canivete Sport',
    sku: 'canivete-sport',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CANIVETE-SPORT-S-ABRIDOR-1-300x300.webp',
    price_min: 67.65,
    price_max: 67.65,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-sport-abridor',
    name: 'Canivete Sport Com Abridor',
    sku: 'canivete-sport-com-abridor',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/10-1-300x300.webp',
    price_min: 67.65,
    price_max: 67.65,
    categories: ['canivetes'],
  },
  {
    id: 'canivete-versa',
    name: 'Canivete Versa',
    sku: 'canivete-versa',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/04-1-300x300.webp',
    price_min: 48.50,
    price_max: 48.50,
    categories: ['canivetes'],
  },

  // Chapéus
  {
    id: 'chapeu-fibra-bambu',
    name: 'Chapéu Fibra de Bambu',
    sku: 'chapeu-fibra-de-bambu',
    image: 'https://artfacas.com/conteudo/uploads/2025/09/CHAPEU-AZUL-300x300.webp',
    price_min: 50.00,
    price_max: 50.00,
    categories: ['chapeus'],
  },

  // Copos
  {
    id: 'caneca-chopp-430ml',
    name: 'Caneca de Chopp 430 ML',
    sku: 'caneca-de-chopp-430-ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/CANECA-DE-CHOPP-430ML-VERDE-300x300.webp',
    price_min: 69.30,
    price_max: 69.30,
    categories: ['copos'],
  },
  {
    id: 'copo-termico-inox-270ml',
    name: 'Copo Térmico Inox 270 ML',
    sku: 'copo-de-inox-termico-270-ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/COPO-DE-INOX-TERMICO-270ML-LARANJA-300x300.webp',
    price_min: 74.25,
    price_max: 74.25,
    categories: ['copos'],
  },
  {
    id: 'copo-termico-abridor',
    name: 'Copo Térmico C/ Abridor',
    sku: 'copo-termico-c-abridor',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/02-300x300.webp',
    price_min: 77.22,
    price_max: 77.22,
    categories: ['copos'],
  },
  {
    id: 'copo-termico-tampa-510ml',
    name: 'Copo Térmico C/ Tampa 510ML',
    sku: 'copo-termico-c-tampa-510ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/15-300x300.webp',
    price_min: 70.40,
    price_max: 70.40,
    categories: ['copos'],
  },
  {
    id: 'copo-termico-polipropileno-250ml',
    name: 'Copo Térmico Dupla Camada 250 ML',
    sku: 'copo-de-plastico-250ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/10-300x300.webp',
    price_min: 42.90,
    price_max: 42.90,
    categories: ['copos'],
  },

  // Facas
  {
    id: 'faca-08-anel',
    name: 'Faca 08 C/ Anel',
    sku: 'faca-08-c-anel',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/14-1-300x300.webp',
    price_min: 195.00,
    price_max: 298.00,
    categories: ['facas'],
  },
  {
    id: 'facas-08-madeira',
    name: 'Facas 08 Madeira',
    sku: 'faca-08-c-anel-copia',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-BOI-MADEIRA-CAIXA-300x300.webp',
    price_min: 220.22,
    price_max: 425.00,
    categories: ['facas'],
  },
  {
    id: 'facas-08-osso',
    name: 'Facas 08 Osso',
    sku: 'facas-08-osso',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/FACA-08AG-OSSO-BAINHA-300x300.webp',
    price_min: 181.50,
    price_max: 410.00,
    categories: ['facas'],
  },
  {
    id: 'facas-08-osso-oitavado',
    name: 'Facas 08 Osso Oitavado',
    sku: 'facas-08-osso-oitavado',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/FACA-08A-OSSO-OITAVADO-COM-CAIXA-300x300.webp',
    price_min: 181.50,
    price_max: 265.00,
    categories: ['facas'],
  },
  {
    id: 'kit-churrasco-4pc',
    name: 'Kit Churrasco 4 Pç.',
    sku: 'kit-bambu-4pc',
    image: 'https://artfacas.com/conteudo/uploads/2025/11/KIT-BAMBU-4PC-300x300.webp',
    price_min: 235.00,
    price_max: 235.00,
    categories: ['facas', 'kits'],
  },

  // Garrafas
  {
    id: 'garrafa-inox-wb-500ml',
    name: 'Garrafa Inox WB 500ML',
    sku: 'garrafa-inox-wb-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/GARRAFA-TERMICA-WB-500ML-BRANCO-300x300.webp',
    price_min: 61.88,
    price_max: 61.88,
    categories: ['garrafas'],
  },
  {
    id: 'garrafa-isotermica-1l',
    name: 'Garrafa Isotérmica 1L Inox',
    sku: 'garrafa-isotermica-1-l',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/41-300x300.webp',
    price_min: 132.00,
    price_max: 132.00,
    categories: ['garrafas'],
  },
  {
    id: 'garrafa-termica-1l',
    name: 'Garrafa Térmica 1L',
    sku: 'garrafa-termica-1l',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/GARRAFA-TERMICA-1L-VERMELHO-300x300.webp',
    price_min: 114.40,
    price_max: 114.40,
    categories: ['garrafas'],
  },
  {
    id: 'garrafa-termica-inox-500ml',
    name: 'Garrafa Térmica Inox 500ML',
    sku: 'garrafa-termica-inox-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/GARRAFA-TERMICA-INOX-500ML-VERDE-300x300.webp',
    price_min: 51.15,
    price_max: 51.15,
    categories: ['garrafas'],
  },
  {
    id: 'garrafa-termica-wb-bambu-500ml',
    name: 'Garrafa Térmica Inox WB Bambu 500ML',
    sku: 'garrafa-termica-inox-wb-bambu-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/GARRAFA-TREMICA-WB-BAMBU-500ML-LARANJA-300x300.webp',
    price_min: 66.00,
    price_max: 66.00,
    categories: ['garrafas'],
  },
  {
    id: 'squeeze-1l-alca-emborrachada',
    name: 'Squeeze 1L C/ Alça Emborrachada',
    sku: 'squeeze-1l-c-alca-emborrachada',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/GARRAFA-1L-C-ALCA-DE-BORRACHA-VERDE-300x300.webp',
    price_min: 61.05,
    price_max: 61.05,
    categories: ['garrafas'],
  },
  {
    id: 'squeeze-aqua-500ml',
    name: 'Squeeze Aqua 500ML',
    sku: 'squeeze-aqua-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/23-300x300.webp',
    price_min: 55.83,
    price_max: 55.83,
    categories: ['garrafas'],
  },
  {
    id: 'squeeze-aquarela-500ml',
    name: 'Squeeze Aquarela 500ML',
    sku: 'squeeze-aquarela-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/SQUEEZE-AQUARELA-500ML-VERMELHO-300x300.webp',
    price_min: 27.83,
    price_max: 27.83,
    categories: ['garrafas'],
  },
  {
    id: 'squeeze-mind-500ml',
    name: 'Squeeze Mind Alumínio 500ML',
    sku: 'squeze-mind-600ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/38-300x300.webp',
    price_min: 27.83,
    price_max: 27.83,
    categories: ['garrafas'],
  },
  {
    id: 'squeeze-tampa-bambu-500ml',
    name: 'Squeeze Tampa Bambu 500ML',
    sku: 'squeeze-tampa-bambu-500ml',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/SQUEEZE-TAMPA-BAMBU-500ML-ROSA-300x300.webp',
    price_min: 27.83,
    price_max: 27.83,
    categories: ['garrafas'],
  },

  // Kits
  {
    id: 'kit-churrasco-bambu-4pecas',
    name: 'Kit Churrasco em Bambu 4 Peças',
    sku: '11058',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/uias-300x300.webp',
    price_min: 118.80,
    price_max: 118.80,
    categories: ['kits'],
  },
  {
    id: 'kit-churrasco-bbq-3119',
    name: 'Kit Churrasco BBQ 3119',
    sku: '10933',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-CHURRASCO-BBQ-3119-300x300.webp',
    price_min: 195.82,
    price_max: 195.82,
    categories: ['kits'],
  },
  {
    id: 'kit-corporativo',
    name: 'Kit Corporativo',
    sku: 'kits-corporativos',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-CORPORATIVO-ROSA-300x300.webp',
    price_min: 160.15,
    price_max: 160.15,
    categories: ['kits'],
  },
  {
    id: 'kit-queijo-2pecas-ovalado',
    name: 'Kit Queijo 2 Peças Ovalado',
    sku: '10705',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/asq-300x300.webp',
    price_min: 115.50,
    price_max: 115.50,
    categories: ['kits'],
  },
  {
    id: 'kit-queijo-3pecas-ovalado',
    name: 'Kit Queijo 3 Peças Ovalado',
    sku: '10707',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-3-PECAS-OVALADA-300x300.webp',
    price_min: 115.50,
    price_max: 115.50,
    categories: ['kits'],
  },
  {
    id: 'kit-queijo-3120',
    name: 'Kit Queijo 3120',
    sku: '10950',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-3120-300x300.webp',
    price_min: 132.00,
    price_max: 132.00,
    categories: ['kits'],
  },
  {
    id: 'kit-queijo-quadrado',
    name: 'Kit Queijo Quadrado',
    sku: '10712',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-QUEIJO-QUADRADO-300x300.webp',
    price_min: 148.50,
    price_max: 148.50,
    categories: ['kits'],
  },
  {
    id: 'kit-start',
    name: 'Kit Start',
    sku: 'kit-start',
    image: 'https://artfacas.com/conteudo/uploads/2025/08/07-4-300x300.webp',
    price_min: 82.90,
    price_max: 82.90,
    categories: ['kits'],
  },
  {
    id: 'kit-vinho-4pecas',
    name: 'Kit Vinho 4 Peças Porta Garrafa',
    sku: '10722',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-VINHO-4-PECAS-300x300.webp',
    price_min: 154.00,
    price_max: 154.00,
    categories: ['kits'],
  },
  {
    id: 'kit-vinho-5pecas-bambu',
    name: 'Kit Vinho 5 Peças Bambu',
    sku: '10721',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/KIT-VINHO-5-PECAS-300x300.webp',
    price_min: 118.80,
    price_max: 118.80,
    categories: ['kits'],
  },
  {
    id: 'maleta-08g-ch',
    name: 'Maleta 08G - CH',
    sku: '10743',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/MALETA-08G-CH-300x300.webp',
    price_min: 72.60,
    price_max: 72.60,
    categories: ['kits'],
  },
  {
    id: 'maleta-08ag-ch',
    name: 'Maleta 08AG - CH',
    sku: '10741',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/MALETA-08AG-CH-300x300.webp',
    price_min: 87.38,
    price_max: 87.38,
    categories: ['kits'],
  },
  {
    id: 'cachaca-2-cop',
    name: 'Cachaça 2 Copos',
    sku: '10679',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/cachaca-300x300.webp',
    price_min: 350.00,
    price_max: 350.00,
    categories: ['kits'],
  },

  // Mochilas
  {
    id: 'mochila-de-lona',
    name: 'Mochila De Lona',
    sku: 'mochila-de-lona',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/06-300x300.webp',
    price_min: 209.00,
    price_max: 209.00,
    categories: ['mochilas'],
  },
  {
    id: 'mochila-pag',
    name: 'Mochila PAG',
    sku: 'mochila-pag',
    image: 'https://artfacas.com/conteudo/uploads/2025/10/10-300x300.webp',
    price_min: 158.40,
    price_max: 158.40,
    categories: ['mochilas'],
  },
];

/**
 * Category mapping from funnel question 8 IDs to product categories
 */
const categoryMapping: Record<string, string[]> = {
  kits: ['kits'],
  garrafas: ['garrafas'],
  cadernos: ['cadernos'],
  facas: ['facas', 'canivetes'],
  copos: ['copos'],
  chapeus: ['chapeus'],
  mochilas: ['mochilas'],
  camping: ['camping'],
  churrasco: ['kits', 'facas'],
  sugestao: [], // empty = show all
};

/**
 * Filter products based on funnel category selections (question 8)
 */
export function getFilteredProducts(selectedCategories: string[], productList?: Product[]): Product[] {
  const source = productList || products;
  if (selectedCategories.includes('sugestao') || selectedCategories.length === 0) {
    return source;
  }

  // Collect all matching product categories
  const productCategories = new Set<string>();
  for (const cat of selectedCategories) {
    const mapped = categoryMapping[cat] || [cat];
    mapped.forEach(c => productCategories.add(c));
  }

  return source.filter(product =>
    product.categories.some(c => productCategories.has(c))
  );
}

/**
 * Fetch products from the database, falling back to static data
 */
export async function fetchProductsFromDB(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return products;
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      image: p.image_url,
      price_min: Number(p.price_min),
      price_max: Number(p.price_max),
      categories: p.categories || [],
      colors: p.colors || [],
      color_images: p.color_images || {},
      color_skus: p.color_skus || {},
    }));
  } catch {
    return products;
  }
}
