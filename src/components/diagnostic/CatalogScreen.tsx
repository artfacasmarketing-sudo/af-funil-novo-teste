import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogoHeader } from './LogoHeader';
import { fetchProductsFromDB, Product } from '@/data/products';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  avgPrice: number;
}

interface CatalogScreenProps {
  onConfirm: (products: CatalogProduct[]) => void;
  onClickSFX: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CatalogScreen({ onConfirm, onClickSFX }: CatalogScreenProps) {
  const [selected, setSelected] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ['products-funnel'],
    queryFn: fetchProductsFromDB,
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts;
  }, [dbProducts]);

  const toggleProduct = (product: Product) => {
    onClickSFX();
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, 1);
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelected(prev => {
      const next = new Map(prev);
      const current = next.get(productId) || 1;
      const newQty = Math.max(1, current + delta);
      next.set(productId, newQty);
      return next;
    });
  };

  const totalEstimate = useMemo(() => {
    let total = 0;
    selected.forEach((qty, id) => {
      const p = products.find(prod => prod.id === id);
      if (p) {
        const avg = (p.price_min + p.price_max) / 2;
        total += avg * qty;
      }
    });
    return total;
  }, [selected, products]);

  const handleConfirm = () => {
    const catalogProducts: CatalogProduct[] = [];
    selected.forEach((qty, id) => {
      const p = products.find(prod => prod.id === id);
      if (p) {
        catalogProducts.push({
          id,
          name: p.name,
          sku: p.sku,
          quantity: qty,
          avgPrice: (p.price_min + p.price_max) / 2,
        });
      }
    });
    onConfirm(catalogProducts);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12 pb-40">
      <LogoHeader />

      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Title */}
          <div className="space-y-2 animate-fade-in-up text-center">
            <div className="inline-block mb-3">
              <span className="px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] bg-primary/10 border border-primary/30 rounded-full text-primary">
                Catálogo AF Brindes
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              Escolha seus produtos
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Selecione os produtos e a quantidade desejada. O orçamento estimado atualiza em tempo real.
            </p>
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-secondary animate-pulse aspect-square" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
              {products.map(product => {
                const isSelected = selected.has(product.id);
                const qty = selected.get(product.id) || 0;
                const avgPrice = (product.price_min + product.price_max) / 2;

                return (
                  <div
                    key={product.id}
                    className={`
                      relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                        : 'ring-1 ring-border hover:ring-muted-foreground/30'}
                    `}
                  >
                    {/* Select check */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}

                    {/* Image - clickable to toggle */}
                    <div className="bg-white cursor-pointer" onClick={() => toggleProduct(product)}>
                      <AspectRatio ratio={1}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </AspectRatio>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-1" onClick={() => !isSelected && toggleProduct(product)}>
                      <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </h3>
                      <p className="text-primary font-bold text-sm sm:text-base">
                        {formatCurrency(avgPrice)}
                        <span className="text-[9px] text-muted-foreground font-normal ml-1">/ un</span>
                      </p>
                    </div>

                    {/* Quantity controls - only when selected */}
                    {isSelected && (
                      <div className="px-3 pb-3 animate-fade-in">
                        <div className="flex items-center justify-between bg-secondary rounded-xl p-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-semibold text-sm mono-font min-w-[2rem] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-center text-[10px] text-muted-foreground mt-1 mono-font">
                          Subtotal: {formatCurrency(avgPrice * qty)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar with total + CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            {selected.size > 0 ? (
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  Orçamento estimado
                </p>
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {formatCurrency(totalEstimate)}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {selected.size} produto{selected.size > 1 ? 's' : ''} selecionado{selected.size > 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione ao menos 1 produto
              </p>
            )}
          </div>
          <Button
            onClick={handleConfirm}
            size="lg"
            disabled={selected.size === 0}
            className="rounded-2xl py-6 px-6 sm:px-8 font-semibold text-base glow-hover gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
