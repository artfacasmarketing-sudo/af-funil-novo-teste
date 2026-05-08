export interface LandingProduct {
  slug: string;
  name: string;
  sku: string;
  tagline: string; // Frase de impacto
  headline: string; // Subtítulo curto
  description: string;
  bullets: string[];
  specs: { label: string; value: string }[];
  unitPriceFrom: number;
  minQty: number;
  images: { url: string; alt: string }[];
  metaTitle: string;
  metaDescription: string;
}

const CHAPEU_BAMBU_BASE =
  'https://oltnjmgcpbabzwgeenho.supabase.co/storage/v1/object/public/product-media/products/28ad2674-9f58-4432-9d8e-5e003972aa0c';

export const landingProducts: Record<string, LandingProduct> = {
  'chapeu-bambu': {
    slug: 'chapeu-bambu',
    name: 'Chapéu Fibra de Bambu',
    sku: 'chapeu-fibra-de-bambu',
    tagline: 'O brinde transforma',
    headline: 'Estilo, conforto e versatilidade — em cada cabeça da sua marca',
    description:
      'O Chapéu de Fibra de Bambu é um dos nossos produtos carro-chefe, unindo estilo, conforto e versatilidade. Ideal para dias de campo, eventos ao ar livre e também para o uso no dia a dia, oferece uma excelente apresentação e um visual marcante. Leve e confortável, é a opção perfeita para quem busca praticidade sem abrir mão do estilo — e a personalização valoriza ainda mais a sua marca.',
    bullets: [
      'Material premium em fibra natural de bambu',
      'Personalização colorida (laser, silk, sublimação ou bordado)',
      'Layout e arte gratuitos pela nossa equipe',
      '12 cores de fita e 5 tamanhos disponíveis',
    ],
    specs: [
      { label: 'Categoria', value: 'Chapéus' },
      { label: 'Material', value: 'Premium' },
      { label: 'Qtd. mínima', value: '10 un' },
      { label: 'Personalização', value: 'Colorido' },
      { label: 'Layout', value: 'Gratuito' },
      { label: 'Prazo médio', value: '15 dias úteis' },
    ],
    unitPriceFrom: 49.37,
    minQty: 10,
    images: [
      { url: `${CHAPEU_BAMBU_BASE}/1777053919407-jxd936-chapeuaa.jpg`, alt: 'Chapéu Fibra de Bambu — destaque' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965368067-a71o3d-ch1.jpg`, alt: 'Chapéu Fibra de Bambu — vista 1' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965369572-ql9rtl-ch-12.jpg`, alt: 'Chapéu Fibra de Bambu — vista 2' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965370918-2xidpc-ch-11.jpg`, alt: 'Chapéu Fibra de Bambu — vista 3' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965372355-sasnbd-ch-10.jpg`, alt: 'Chapéu Fibra de Bambu — vista 4' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965373576-1gqh5p-ch-9.jpg`, alt: 'Chapéu Fibra de Bambu — vista 5' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965375508-v61s9g-ch-8.jpg`, alt: 'Chapéu Fibra de Bambu — vista 6' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965376734-p12kwp-ch-7.jpg`, alt: 'Chapéu Fibra de Bambu — vista 7' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965378196-kwd2st-ch-6.jpg`, alt: 'Chapéu Fibra de Bambu — vista 8' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965379504-48s92q-ch-5.jpg`, alt: 'Chapéu Fibra de Bambu — vista 9' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965381216-w2tpiu-ch-4.jpg`, alt: 'Chapéu Fibra de Bambu — vista 10' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965382541-zaja69-ch-3.jpg`, alt: 'Chapéu Fibra de Bambu — vista 11' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965383704-94rnj3-ch2.jpg`, alt: 'Chapéu Fibra de Bambu — vista 12' },
      { url: `${CHAPEU_BAMBU_BASE}/1776965400359-ktqtrc-ch.jpg`, alt: 'Chapéu Fibra de Bambu — vista 13' },
    ],
    metaTitle: 'Chapéu Fibra de Bambu Personalizado | Brinde Corporativo',
    metaDescription:
      'Chapéu de fibra de bambu personalizado com a sua marca. Estilo, conforto e versatilidade para brindes, eventos e ações promocionais.',
  },
};

export function getLandingProduct(slug: string): LandingProduct | undefined {
  return landingProducts[slug];
}
