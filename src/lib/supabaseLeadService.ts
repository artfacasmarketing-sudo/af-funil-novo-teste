import { supabase } from '@/integrations/supabase/client';
import { getUTMParams, getReferrer, getPageURL } from './webhookService';

// Map question responses to readable labels
const goalLabels: Record<string, string> = {
  encantar: 'Encantar e surpreender',
  fidelizar: 'Fidelizar clientes',
  valorizar: 'Valorizar a marca',
  promocional: 'Ação promocional',
  interno: 'Reconhecimento interno',
};

const occasionLabels: Record<string, string> = {
  corp: 'Evento corporativo',
  social: 'Evento social',
  clientes: 'Ação com clientes/parceiros',
  interno_uso: 'Ação interna',
  ativacao: 'Lançamento/ativação',
};

const audienceLabels: Record<string, string> = {
  exec: 'Executivos / Alto Padrão',
  cliente: 'Clientes',
  colab: 'Colaboradores',
  influ: 'Influenciadores',
  misto: 'Público misto',
};

const quantityLabels: Record<string, string> = {
  q1: 'Até 30',
  q2: '31 a 100',
  q3: '101 a 300',
  q4: '300 a 500',
  q5: '500 a 1000',
  q6: '1000+',
};

const budgetLabels: Record<string, string> = {
  b0: 'De R$ 1.000 a R$ 3.000',
  b1: 'De R$ 3.000 a R$ 7.000',
  b2: 'De R$ 7.000 a R$ 15.000',
  b3: 'De R$ 15.000 a R$ 30.000',
  b4: 'De R$ 30.000 a R$ 100.000',
  b5: 'De R$ 100.000 a R$ 1.000.000',
};

const deadlineLabels: Record<string, string> = {
  u1: 'Até 7 dias (Urgente)',
  u2: '8–15 dias',
  u3: '16–30 dias',
  u4: '30+ dias',
  u5: 'Sem data definida',
};

const categoryLabels: Record<string, string> = {
  kits: 'Kits / Kits Corporativos',
  garrafas: 'Garrafas / Squeezes',
  cadernos: 'Cadernos',
  facas: 'Facas / Canivetes',
  copos: 'Copos / Canecas',
  chapeus: 'Chapéus',
  mochilas: 'Mochilas',
  camping: 'Camping',
  sugestao: 'Quero que vocês escolham por mim',
};

const colorLabels: Record<string, string> = {
  black: 'Preto',
  white: 'Branco',
  gray: 'Cinza',
  blue: 'Azul',
  red: 'Vermelho',
  green: 'Verde',
  yellow: 'Amarelo',
  orange: 'Laranja',
  purple: 'Roxo',
  pink: 'Rosa',
  brown: 'Marrom',
  gold: 'Dourado',
  silver: 'Prata',
};

// File upload constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'application/pdf',
];

/**
 * Validate a file before upload
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo "${file.name}" excede o limite de 5MB` };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Tipo de arquivo não permitido: ${file.type}. Use PNG, JPG, SVG, WebP ou PDF.` 
    };
  }
  
  return { valid: true };
}

/**
 * Upload brand files to Supabase Storage with validation
 */
export async function uploadBrandFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      console.warn('[Storage] File validation failed:', validation.error);
      continue;
    }
    
    // Use random UUID to prevent URL enumeration attacks
    const uuid = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${uuid}.${ext}`;
    
    if (import.meta.env.DEV) console.log('[Storage] Uploading file:', fileName);
    
    const { data, error } = await supabase.storage
      .from('brand-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('[Storage] Upload error:', error);
      continue;
    }

    if (data) {
      const { data: urlData } = supabase.storage
        .from('brand-files')
        .getPublicUrl(data.path);
      
      if (import.meta.env.DEV) console.log('[Storage] File uploaded, URL:', urlData.publicUrl);
      urls.push(urlData.publicUrl);
    }
  }
  
  return urls;
}

interface FormData {
  name: string;
  whatsapp: string;
  email?: string;
  company?: string;
  extra?: string;
  documentType?: 'cpf' | 'cnpj';
  documentNumber?: string;
  stateRegistration?: string;
  presentationPreference?: 'whatsapp' | 'call';
  scheduledDate?: string;
  scheduledTime?: string;
}

interface SubmitResult {
  success: boolean;
  lead_id?: string;
  webhook_sent?: boolean;
  error?: string;
}

/**
 * Build and submit lead to edge function
 */
export async function submitLeadToCloud(
  responses: Record<string, any>,
  formData: FormData,
  selectedPath: string,
  fileUrls: string[],
  selectedProducts?: { id: string; name: string; sku: string }[]
): Promise<SubmitResult> {
  // Extract responses by question ID
  const goalId = responses[1] || '';
  const occasionId = responses[2] || '';
  const audienceId = responses[3] || '';
  const niche = responses[4] || '';
  const quantityId = responses[5] || '';
  const budgetId = responses[6] || '';
  const deadlineId = responses[7] || '';
  const categoriesRaw = responses[8] || '';
  const colorsRaw = responses[9] || '';

  // Parse categories
  const categoriesArray = categoriesRaw ? categoriesRaw.split(',') : [];
  const categories = categoriesArray.map((id: string) => categoryLabels[id] || id);

  // Parse colors
  let colorsData: { 
    cor_preferida_lista: string[]; 
    cor_marca_flag: boolean; 
    cor_codigos: string;
  } = { cor_preferida_lista: [], cor_marca_flag: false, cor_codigos: '' };
  
  try {
    if (colorsRaw) {
      colorsData = JSON.parse(colorsRaw);
    }
  } catch (e) {
    console.warn('[Lead] Failed to parse colors:', e);
  }

  const selectedColors = (colorsData.cor_preferida_lista || []).map(
    (id: string) => colorLabels[id] || id
  );

  // Build payload for edge function
  const payload = {
    name: formData.name.trim(),
    whatsapp: formData.whatsapp.trim(),
    email: formData.email?.trim() || null,
    company: formData.company?.trim() || null,
    goal: goalLabels[goalId] || goalId || null,
    occasion: occasionLabels[occasionId] || occasionId || null,
    audience: audienceLabels[audienceId] || audienceId || null,
    niche: niche || null,
    quantity_range: quantityLabels[quantityId] || quantityId || null,
    budget_range: budgetLabels[budgetId] || budgetId || null,
    deadline_range: deadlineLabels[deadlineId] || deadlineId || null,
    categories,
    path_chosen: selectedPath,
    colors: {
      brand_colors: colorsData.cor_marca_flag === true,
      selected: selectedColors,
      codes: colorsData.cor_codigos || '',
    },
    file_urls: fileUrls,
    selected_products: (selectedProducts || []).map(p => ({ name: p.name, sku: p.sku })),
    must_have: formData.extra?.trim() || null,
    document_type: formData.documentType || null,
    document_number: formData.documentNumber?.trim() || null,
    state_registration: formData.stateRegistration?.trim() || null,
    presentation_preference: formData.presentationPreference || null,
    scheduled_date: formData.scheduledDate || null,
    scheduled_time: formData.scheduledTime || null,
    utm: getUTMParams(),
    referrer: getReferrer(),
    page_url: getPageURL(),
  };

  const { data, error } = await supabase.functions.invoke('submit-lead', {
    body: payload,
  });

  if (error) {
    if (import.meta.env.DEV) console.error('[Lead] Edge function error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: data?.success || false, 
    lead_id: data?.lead_id,
    webhook_sent: data?.webhook_sent,
    error: data?.error
  };
}
