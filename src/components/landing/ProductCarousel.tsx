import { useEffect, useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ProductCarouselProps {
  images: { url: string; alt: string }[];
}

export function ProductCarousel({ images }: ProductCarouselProps) {
  const autoplay = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true }),
  );
  const apiRef = useRef<CarouselApi | null>(null);
  const [selected, setSelected] = useStateSafe(0);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [apiRef.current]);

  return (
    <div className="w-full">
      <Carousel
        opts={{ loop: true, align: 'center' }}
        plugins={[autoplay.current]}
        setApi={(api) => {
          apiRef.current = api;
        }}
        className="relative"
      >
        <CarouselContent>
          {images.map((img, i) => (
            <CarouselItem key={img.url} className="basis-full">
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-muted">
                <img
                  src={img.url}
                  alt={img.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 hidden sm:flex bg-background/70 backdrop-blur" />
        <CarouselNext className="right-3 hidden sm:flex bg-background/70 backdrop-blur" />
      </Carousel>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para imagem ${i + 1}`}
            onClick={() => apiRef.current?.scrollTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === selected ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/30 hover:bg-foreground/50',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Local helper to avoid pulling extra import
import { useState } from 'react';
function useStateSafe<T>(initial: T) {
  return useState<T>(initial);
}
