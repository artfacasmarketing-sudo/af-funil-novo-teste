import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogoHeader } from './LogoHeader';
import { Progress } from '@/components/ui/progress';

import { phaseNames } from '@/data/questions';
import { getFilteredProducts, fetchProductsFromDB, Product } from '@/data/products';
import { Check } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface SelectedProduct {
  id: string;
  name: string;
  sku: string;
}

interface ProductSelectionScreenProps {
  responses: Record<string, any>;
  onConfirm: (products: SelectedProduct[]) => void;
  onClickSFX: () => void;
}

function formatPrice(min: number, max: number): string {
  const displayMin = min * 0.8;
  const displayMax = max * 1.2;
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return `${fmt(displayMin)} – ${fmt(displayMax)}`;
}

const TOTAL_QUESTIONS = 10;

export function ProductSelectionScreen({ responses, onConfirm, onClickSFX }: ProductSelectionScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);
  const mounted = useRef(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ['products-funnel'],
    queryFn: fetchProductsFromDB,
    staleTime: 5 * 60 * 1000,
  });

  // Parse selected colors from question 9
  const selectedColors = useMemo(() => {
    try {
      const colorsData = responses[9] ? JSON.parse(responses[9]) : {};
      return (colorsData.cor_preferida_lista || []) as string[];
    } catch { return []; }
  }, [responses]);

  const filteredProducts = useMemo(() => {
    if (isLoading || !dbProducts) return [];
    const categoriesRaw = responses[8] || '';
    const cats = categoriesRaw ? categoriesRaw.split(',') : [];
    return getFilteredProducts(cats, dbProducts);
  }, [responses, dbProducts, isLoading]);

  // Triple the products for infinite scroll
  const tripled = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    return [...filteredProducts, ...filteredProducts, ...filteredProducts];
  }, [filteredProducts]);

  const singleBlockWidth = useRef(0);

  // Position scroll at center block on mount
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || filteredProducts.length === 0) return;

    mounted.current = false;
    requestAnimationFrame(() => {
      singleBlockWidth.current = container.scrollWidth / 3;
      container.scrollLeft = singleBlockWidth.current;
      mounted.current = true;
    });
  }, [filteredProducts]);

  // Handle infinite scroll jumps
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isJumping.current || !mounted.current || filteredProducts.length === 0) return;

    const blockW = singleBlockWidth.current;
    if (blockW === 0) return;

    const sl = container.scrollLeft;
    const threshold = 50;

    if (sl < threshold) {
      isJumping.current = true;
      container.scrollTo({ left: sl + blockW, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => { isJumping.current = false; });
    } else if (sl > blockW * 2 - container.clientWidth - threshold) {
      isJumping.current = true;
      container.scrollTo({ left: sl - blockW, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => { isJumping.current = false; });
    }
  }, [filteredProducts]);

  const toggle = (id: string) => {
    onClickSFX();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const products = Array.from(selected).map(id => {
      const p = filteredProducts.find(prod => prod.id === id);
      return { id, name: p?.name || '', sku: p?.sku || '' };
    });
    onConfirm(products);
  };

  const progress = (TOTAL_QUESTIONS / (TOTAL_QUESTIONS + 1)) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
      <LogoHeader />

      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
          {/* Progress section */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="mono-font uppercase text-[10px] sm:text-xs text-muted-foreground">
                  Etapa 5 de 5
                </span>
                <span className="text-primary font-semibold text-sm sm:text-base">
                  {phaseNames[5]}
                </span>
              </div>
              <span className="mono-font text-[10px] sm:text-xs text-muted-foreground">
                {TOTAL_QUESTIONS + 1} / {TOTAL_QUESTIONS + 1}
              </span>
            </div>

            <Progress
              value={progress}
              className="h-1.5 sm:h-2 bg-muted"
            />
          </div>

          {/* Title */}
          <div className="space-y-2 sm:space-y-3 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              Produtos recomendados para você
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Selecione os produtos que te interessam
            </p>
          </div>
        </div>
      </div>

      {/* Carousel with infinite scroll */}
      <div className="relative mt-6 sm:mt-8">
        {isLoading ? (
          <div className="py-16 sm:py-20" />
        ) : (
          <div
            key={filteredProducts.length}
            ref={scrollRef}
            onScroll={handleScroll}
            className="product-carousel overflow-x-auto pb-4 scrollbar-hide"
          >
            <div className="flex gap-3 sm:gap-4 items-start animate-fade-in">
              {tripled.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  isSelected={selected.has(product.id)}
                  onToggle={() => toggle(product.id)}
                  selectedColors={selectedColors}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div className="flex items-center justify-center mt-6 sm:mt-8">
        <div className="w-full max-w-2xl">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
          >
            {selected.size > 0
              ? `Confirmar ${selected.size} produto${selected.size > 1 ? 's' : ''}`
              : 'Pular e continuar'}
          </Button>

          {/* Footer signature */}
          <div className="flex items-center justify-center gap-2 pt-6 sm:pt-8 opacity-15">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-semibold">
              Curadoria Consultiva AF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  isSelected,
  onToggle,
  selectedColors,
}: {
  product: Product;
  isSelected: boolean;
  onToggle: () => void;
  selectedColors: string[];
}) {
  // Pick color-specific image if available
  const displayImage = useMemo(() => {
    if (product.color_images && selectedColors.length > 0) {
      const match = selectedColors.find(c => product.color_images?.[c]);
      if (match) return product.color_images[match];
    }
    return product.image;
  }, [product, selectedColors]);
  return (
    <button
      onClick={onToggle}
      className={`
        relative flex-shrink-0 w-[220px] sm:w-[260px] rounded-2xl overflow-hidden
        text-left transition-shadow duration-200
        ${isSelected
          ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
          : 'ring-1 ring-border hover:ring-muted-foreground/30'}
      `}
    >
      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}

      {/* Image with white background */}
      <div className="bg-white">
        <AspectRatio ratio={1}>
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </AspectRatio>
      </div>

      {/* Info */}
      <div className="p-3 h-[8rem] flex flex-col justify-between">
        <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 h-[2.5rem]">
          {product.name}
        </h3>
        <span className="text-[9px] text-muted-foreground mono-font">
          Qtd: 10 – 1.000+
        </span>
        <p className="text-primary font-bold text-sm sm:text-base">
          {formatPrice(product.price_min, product.price_max)}
        </p>
        <span className="text-[9px] text-muted-foreground mono-font">
          preço por unidade
        </span>
        <span className="text-[10px] text-muted-foreground mono-font uppercase block truncate line-clamp-1">
          SKU: {product.sku}
        </span>
      </div>
    </button>
  );
}
