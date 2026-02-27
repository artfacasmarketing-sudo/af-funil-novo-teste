const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`;

export interface DBProduct {
  id: string;
  name: string;
  sku: string;
  image_url: string;
  price_min: number;
  price_max: number;
  categories: string[];
  colors: string[];
  color_images: Record<string, string>;
  color_skus: Record<string, string>;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

async function callAdmin(password: string, action: string, data?: any) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, password, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro desconhecido");
  return json;
}

export const adminApi = {
  list: (pw: string) => callAdmin(pw, "list") as Promise<{ products: DBProduct[] }>,
  create: (pw: string, data: Partial<DBProduct>) => callAdmin(pw, "create", data),
  update: (pw: string, data: Partial<DBProduct>) => callAdmin(pw, "update", data),
  delete: (pw: string, id: string) => callAdmin(pw, "delete", { id }),
};

export const CATEGORY_OPTIONS = [
  { id: "cadernos", label: "Cadernos" },
  { id: "mais-vendidos", label: "Mais Vendidos" },
  { id: "camping", label: "Camping" },
  { id: "canivetes", label: "Canivetes" },
  { id: "chapeus", label: "Chapéus" },
  { id: "copos", label: "Copos" },
  { id: "facas", label: "Facas" },
  { id: "garrafas", label: "Garrafas" },
  { id: "kits", label: "Kits" },
  { id: "mochilas", label: "Mochilas" },
];

export const COLOR_OPTIONS = [
  { id: "black", label: "Preto", hex: "#000000" },
  { id: "white", label: "Branco", hex: "#FFFFFF" },
  { id: "gray", label: "Cinza", hex: "#808080" },
  { id: "blue", label: "Azul", hex: "#0000FF" },
  { id: "red", label: "Vermelho", hex: "#FF0000" },
  { id: "green", label: "Verde", hex: "#008000" },
  { id: "yellow", label: "Amarelo", hex: "#FFFF00" },
  { id: "orange", label: "Laranja", hex: "#FFA500" },
  { id: "purple", label: "Roxo", hex: "#800080" },
  { id: "pink", label: "Rosa", hex: "#FFC0CB" },
  { id: "brown", label: "Marrom", hex: "#A52A2A" },
  { id: "gold", label: "Dourado", hex: "#D4AF37" },
  { id: "silver", label: "Prata", hex: "#C0C0C0" },
];
