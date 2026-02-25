import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { adminApi, DBProduct, COLOR_OPTIONS } from "@/lib/adminApi";
import { ProductForm } from "./ProductForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductListProps {
  password: string;
}

export function ProductList({ password }: ProductListProps) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<DBProduct | null>(null);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { products } = await adminApi.list(password);
      setProducts(products);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleToggleActive = async (product: DBProduct) => {
    try {
      await adminApi.update(password, { id: product.id, active: !product.active } as any);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await adminApi.delete(password, deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      toast({ title: "Produto excluído" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleSave = async (data: Partial<DBProduct>) => {
    try {
      if (editingProduct) {
        await adminApi.update(password, { ...data, id: editingProduct.id });
        toast({ title: "Produto atualizado" });
      } else {
        await adminApi.create(password, data);
        toast({ title: "Produto criado" });
      }
      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditingProduct(p);
    setShowForm(true);
  };

  const colorHex = (id: string) => COLOR_OPTIONS.find((c) => c.id === id)?.hex || "#888";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Produtos ({products.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="hidden lg:table-cell">Categorias</TableHead>
                <TableHead className="hidden lg:table-cell">Cores</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="w-16">Ativo</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-20 h-20 rounded object-cover bg-white"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{p.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground mono-font">
                    {p.sku}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.categories.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1">
                      {p.colors.slice(0, 5).map((c) => (
                        <span
                          key={c}
                          className="w-4 h-4 rounded-full border border-border inline-block"
                          style={{ backgroundColor: colorHex(c) }}
                          title={c}
                        />
                      ))}
                      {p.colors.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{p.colors.length - 5}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm mono-font">
                    {p.price_min === p.price_max
                      ? `R$ ${Number(p.price_min).toFixed(2)}`
                      : `R$ ${Number(p.price_min).toFixed(2)} – ${Number(p.price_max).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.active}
                      onCheckedChange={() => handleToggleActive(p)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(p)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSave}
        password={password}
      />

      <DeleteConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        productName={deletingProduct?.name || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
