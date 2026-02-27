export interface QuestionOption {
  id: string;
  label: string;
}

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface Question {
  id: number;
  phase: number;
  type: 'tiles' | 'single' | 'multi' | 'text' | 'color-picker' | 'file-upload';
  title: string;
  subtitle: string;
  options?: QuestionOption[];
  placeholder?: string;
}

export const colorOptions: ColorOption[] = [
  { id: 'black', label: 'Preto', hex: '#000000' },
  { id: 'white', label: 'Branco', hex: '#FFFFFF' },
  { id: 'gray', label: 'Cinza', hex: '#808080' },
  { id: 'blue', label: 'Azul', hex: '#0000FF' },
  { id: 'red', label: 'Vermelho', hex: '#FF0000' },
  { id: 'green', label: 'Verde', hex: '#008000' },
  { id: 'yellow', label: 'Amarelo', hex: '#FFFF00' },
  { id: 'orange', label: 'Laranja', hex: '#FFA500' },
  { id: 'purple', label: 'Roxo', hex: '#800080' },
  { id: 'pink', label: 'Rosa', hex: '#FFC0CB' },
  { id: 'brown', label: 'Marrom', hex: '#A52A2A' },
  { id: 'gold', label: 'Dourado', hex: '#D4AF37' },
  { id: 'silver', label: 'Prata', hex: '#C0C0C0' },
];

export const questions: Question[] = [
  {
    id: 1,
    phase: 1,
    type: 'tiles',
    title: 'Qual é o objetivo principal do brinde?',
    subtitle: 'Direciona a estratégia de impacto da marca.',
    options: [
      { id: 'encantar', label: 'Encantar e surpreender' },
      { id: 'fidelizar', label: 'Fidelizar clientes' },
      { id: 'valorizar', label: 'Valorizar a marca' },
      { id: 'promocional', label: 'Ação promocional' },
      { id: 'interno', label: 'Reconhecimento interno' },
    ],
  },
  {
    id: 2,
    phase: 1,
    type: 'single',
    title: 'Onde será usado?',
    subtitle: 'Define o contexto de entrega do brinde.',
    options: [
      { id: 'corp', label: 'Evento corporativo' },
      { id: 'social', label: 'Evento social' },
      { id: 'clientes', label: 'Ação com clientes/parceiros' },
      { id: 'interno_uso', label: 'Ação interna' },
      { id: 'ativacao', label: 'Lançamento/ativação' },
    ],
  },
  {
    id: 3,
    phase: 2,
    type: 'tiles',
    title: 'Quem vai receber?',
    subtitle: 'O perfil define o nível de sofisticação do item.',
    options: [
      { id: 'exec', label: 'Executivos / Alto Padrão' },
      { id: 'cliente', label: 'Clientes' },
      { id: 'colab', label: 'Colaboradores' },
      { id: 'influ', label: 'Influenciadores' },
      { id: 'misto', label: 'Público misto' },
    ],
  },
  {
    id: 4,
    phase: 2,
    type: 'text',
    title: 'Qual o nicho/segmento?',
    subtitle: 'Nos ajuda a personalizar ainda mais a curadoria.',
    placeholder: 'Ex: Agro, Tecnologia, Imobiliário...',
  },
  {
    id: 5,
    phase: 3,
    type: 'single',
    title: 'Quantas pessoas serão presenteadas?',
    subtitle: 'Escala influencia o custo unitário e logística.',
    options: [
      { id: 'q1', label: 'Até 30' },
      { id: 'q2', label: '31 a 100' },
      { id: 'q3', label: '101 a 300' },
      { id: 'q4', label: '300 a 500' },
      { id: 'q5', label: '500 a 1000' },
      { id: 'q6', label: '1000+' },
    ],
  },
  {
    id: 6,
    phase: 3,
    type: 'single',
    title: 'Qual a verba TOTAL disponível?',
    subtitle: 'Ajuda a calibrar as opções dentro do seu orçamento.',
    options: [
      { id: 'b0', label: 'De R$ 1.000 a R$ 3.000' },
      { id: 'b1', label: 'De R$ 3.000 a R$ 7.000' },
      { id: 'b2', label: 'De R$ 7.000 a R$ 15.000' },
      { id: 'b3', label: 'De R$ 15.000 a R$ 30.000' },
      { id: 'b4', label: 'De R$ 30.000 a R$ 100.000' },
      { id: 'b5', label: 'De R$ 100.000 a R$ 1.000.000' },
    ],
  },
  {
    id: 7,
    phase: 4,
    type: 'single',
    title: 'Pra quando você precisa receber?',
    subtitle: 'Urgência define a viabilidade de personalizações complexas.',
    options: [
      { id: 'u1', label: 'Até 7 dias (Urgente)' },
      { id: 'u2', label: '8–15 dias' },
      { id: 'u3', label: '16–30 dias' },
      { id: 'u4', label: '30+ dias' },
      { id: 'u5', label: 'Sem data definida' },
    ],
  },
  {
    id: 8,
    phase: 5,
    type: 'multi',
    title: 'Você já tem interesse em alguma categoria?',
    subtitle: 'Selecione uma ou mais categorias ou peça sugestões.',
    options: [
      { id: 'kits', label: 'Kits / Kits Corporativos' },
      { id: 'mais-vendidos', label: 'Mais Vendidos' },
      { id: 'garrafas', label: 'Garrafas / Squeezes' },
      { id: 'cadernos', label: 'Cadernos' },
      { id: 'facas', label: 'Facas / Canivetes' },
      { id: 'copos', label: 'Copos / Canecas' },
      { id: 'chapeus', label: 'Chapéus' },
      { id: 'mochilas', label: 'Mochilas' },
      { id: 'churrasco', label: 'Kit Churrasco' },
      { id: 'sugestao', label: 'Quero que vocês escolham por mim' },
    ],
  },
  {
    id: 9,
    phase: 5,
    type: 'color-picker',
    title: 'Selecione as cores da campanha',
    subtitle: 'Escolha as cores do evento ou informe os códigos da sua marca.',
  },
  {
    id: 10,
    phase: 5,
    type: 'file-upload',
    title: 'Envie sua logo e arquivos da marca',
    subtitle: 'Anexe logo, manual de marca ou qualquer referência visual.',
  },
];

export const phaseNames: Record<number, string> = {
  1: 'Contexto',
  2: 'Público',
  3: 'Investimento',
  4: 'Cronograma',
  5: 'Curadoria',
};
