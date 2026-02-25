import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DBProduct, CATEGORY_OPTIONS, COLOR_OPTIONS } from "@/lib/adminApi";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Plus } from "lucide-react";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DBProduct | null;
  onSave: (data: Partial<DBProduct>) => Promise<void>;
  password: string;
}

export function ProductForm({ open, onOpenChange, product, onSave, password }: ProductFormProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [colorSkus, setColorSkus] = useState<Record<string, string>>({});
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setImageUrl(product.image_url);
        setPriceMin(String(product.price_min));
        setPriceMax(String(product.price_max));
        setCategories(product.categories);
        setColorImages(product.color_images || {});
        setColorSkus(product.color_skus || {});
        setActive(product.active);
        setSortOrder(String(product.sort_order));
      } else {
        setName("");
        setSku("");
        setImageUrl("");
        setPriceMin("");
        setPriceMax("");
        setCategories([]);
        setColorImages({});
        setColorSkus({});
        setActive(true);
        setSortOrder("0");
      }
    }
  }, [open, product]);

  const toggleCategory = (id: string) =>
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleColorImageUpload = async (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColor(colorId);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setColorImages(prev => ({ ...prev, [colorId]: data.publicUrl }));
    } catch (err: any) {
      console.error("Upload error:", err);
    } finally {
      setUploadingColor(null);
    }
  };

  const addColor = (colorId: string) => {
    if (!colorImages[colorId]) {
      setColorImages(prev => ({ ...prev, [colorId]: "" }));
    }
  };

  const removeColor = (colorId: string) => {
    setColorImages(prev => {
      const next = { ...prev };
      delete next[colorId];
      return next;
    });
    setColorSkus(prev => {
      const next = { ...prev };
      delete next[colorId];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !imageUrl || !priceMin) return;
    setSaving(true);
    try {
      const colors = Object.keys(colorImages);
      await onSave({
        name,
        sku,
        image_url: imageUrl,
        price_min: parseFloat(priceMin),
        price_max: parseFloat(priceMax || priceMin),
        categories,
        colors,
        color_images: colorImages,
        color_skus: colorSkus,
        active,
        sort_order: parseInt(sortOrder) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const availableColors = COLOR_OPTIONS.filter(c => !colorImages.hasOwnProperty(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Image (fallback) */}
          <div className="space-y-2">
            <Label>Imagem Principal (fallback)</Label>
            {imageUrl && (
              <div className="relative w-24 h-24">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded bg-white" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                <span className="flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload imagem
                </span>
              </Button>
            </label>
          </div>

          {/* Name & SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>SKU *</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Preço Mín *</Label>
              <Input
                type="number"
                step="0.01"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Preço Máx</Label>
              <Input
                type="number"
                step="0.01"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={categories.includes(cat.id) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Color Images */}
          <div className="space-y-3">
            <Label>Imagens por Cor</Label>
            
            {Object.entries(colorImages).map(([colorId, url]) => {
              const colorOpt = COLOR_OPTIONS.find(c => c.id === colorId);
              if (!colorOpt) return null;
              return (
                <div key={colorId} className="space-y-2 p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-border/50 flex-shrink-0"
                      style={{ backgroundColor: colorOpt.hex }}
                    />
                    <span className="text-sm font-medium w-16 flex-shrink-0">{colorOpt.label}</span>
                    
                    {url && (
                      <img src={url} alt={colorOpt.label} className="w-10 h-10 object-cover rounded bg-white flex-shrink-0" />
                    )}
                    
                    <div className="flex-1" />
                    
                    <button
                      type="button"
                      onClick={() => removeColor(colorId)}
                      className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="SKU desta cor"
                      value={colorSkus[colorId] || ""}
                      onChange={(e) => setColorSkus(prev => ({ ...prev, [colorId]: e.target.value }))}
                      className="w-32 h-8 text-xs"
                    />
                    <label className="cursor-pointer flex-shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleColorImageUpload(colorId, e)}
                      />
                      <Button type="button" variant="outline" size="icon" asChild disabled={uploadingColor === colorId} className="h-8 w-8">
                        <span>
                          {uploadingColor === colorId
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Upload className="w-3 h-3" />}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              );
            })}

            {/* Add color button with dropdown */}
            {availableColors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => addColor(color.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: color.hex }} />
                    <Plus className="w-2.5 h-2.5" />
                    {color.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active + Sort */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} />
              <Label>Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : product ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
