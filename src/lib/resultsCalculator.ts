export interface CategoryRecommendation {
  name: string;
  why: string;
}

export interface PathRecommendation {
  title: string;
  description: string;
  categories: CategoryRecommendation[];
  focus: string;
  upgrade?: string;
}

export interface DiagnosticResults {
  objective: string;
  audience: string;
  scale: string;
  direction: string;
  summary: string;
  urgency: string;
  paths: PathRecommendation[];
}

const objectiveLabels: Record<string, string> = {
  encantar: 'Encantar e Surpreender',
  fidelizar: 'Fidelizar Clientes',
  valorizar: 'Valorizar a Marca',
  promocional: 'Ação Promocional',
  interno: 'Reconhecimento Interno',
};

const audienceLabels: Record<string, string> = {
  exec: 'Executivos / Alto Padrão',
  cliente: 'Clientes',
  colab: 'Colaboradores',
  influ: 'Influenciadores',
  misto: 'Público Misto',
};

const scaleLabels: Record<string, string> = {
  q1: 'Até 30',
  q2: '31 a 100',
  q3: '101 a 300',
  q4: '300+',
};

// Category inventory
const champions: CategoryRecommendation[] = [
  { name: 'Chapéu de Bambu AF', why: 'Nosso campeão absoluto de vendas. Estilo único e conexão com a natureza.' },
  { name: 'Kit Corporativo AF', why: 'O grande campeão para eventos. Versatilidade e sofisticação garantida.' },
];

const leather: CategoryRecommendation[] = [
  { name: 'Mala de Viagem em Couro', why: 'O ápice do luxo corporativo para executivos de alto escalão.' },
  { name: 'Mochila Premium em Couro', why: 'Durabilidade e elegância para o dia a dia executivo.' },
  { name: 'Necessaire & Carteira AF', why: 'Acessórios refinados em couro legítimo que exalam exclusividade.' },
];

const craft: CategoryRecommendation[] = [
  { name: 'Facas Artesanais Artfacas', why: 'Peças exclusivas feitas à mão. Um presente para a vida toda.' },
  { name: 'Canivetes de Precisão', why: 'Funcionalidade tática com acabamento de joalheria.' },
  { name: 'Kit Artfacas Premium', why: 'Seleção rigorosa das nossas melhores lâminas e acessórios.' },
];

const standard: CategoryRecommendation[] = [
  { name: 'Garrafas / Squeezes', why: 'Combina utilidade e exposição diária da marca.' },
  { name: 'Cadernos Premium', why: 'Elegância e funcionalidade no dia a dia.' },
  { name: 'Copos / Canecas', why: 'Versátil para celebrações e ações rápidas.' },
];

// New mapping: responses[1]=goal, [2]=occasion, [3]=audience, [4]=niche, [5]=quantity, [6]=budget, [7]=deadline, [8]=categories, [9]=colors
export function calculateResults(responses: Record<string, any>): DiagnosticResults {
  const objectiveId = responses[1] || 'valorizar';
  const audienceId = responses[3] || 'misto';
  const quantityId = responses[5] || 'q2';
  const budgetId = responses[6] || 'b3';
  const urgencyId = responses[7] || 'u3';

  const objectiveLabel = objectiveLabels[objectiveId] || objectiveLabels.valorizar;
  const audienceLabel = audienceLabels[audienceId] || audienceLabels.misto;
  const scaleLabel = scaleLabels[quantityId] || scaleLabels.q2;

  // Calculate direction
  let direction = 'Premium Funcional';
  if (audienceId === 'exec' || objectiveId === 'valorizar' || objectiveId === 'encantar') {
    direction = 'Premium Impacto';
  } else if (quantityId === 'q4' && (budgetId === 'b1' || budgetId === 'b2')) {
    direction = 'Institucional';
  }

  // Calculate urgency display
  const urgency = urgencyId === 'u1' ? 'Urgente (Prioridade AF)' : 'Planejado';

  // Build paths
  const paths: PathRecommendation[] = [
    {
      title: 'Caminho Conservador',
      description: 'Melhor para quem quer padronização e eficiência, mantendo bom valor percebido.',
      categories: [champions[1], standard[0], standard[1]],
      focus: 'Consistência, clareza, execução objetiva.',
    },
    {
      title: 'Caminho Moderado',
      description: 'Melhor para equilibrar impacto e orçamento com escolhas seguras e premium.',
      categories: [champions[0], craft[1], leather[1]],
      focus: 'Equilíbrio entre custo e percepção de valor.',
      upgrade: 'Gravação a laser personalizada em cada item.',
    },
    {
      title: 'Caminho Ousado / Premium Impacto',
      description: 'Melhor para impressionar e criar experiência: presente que vira lembrança.',
      categories: [leather[0], craft[0], craft[2]],
      focus: 'Memorabilidade e sofisticação em cada detalhe.',
      upgrade: 'Embalagem em caixa de madeira reflorestada ou couro.',
    },
  ];

  return {
    objective: objectiveLabel,
    audience: audienceLabel,
    scale: scaleLabel,
    direction,
    summary: `Curadoria estratégica alinhada ao objetivo de ${objectiveLabel}.`,
    urgency,
    paths,
  };
}
