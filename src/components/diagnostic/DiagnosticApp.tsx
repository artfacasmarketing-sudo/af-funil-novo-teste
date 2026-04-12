import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAudio } from '@/hooks/useAudio';
import { fetchProductsFromDB } from '@/data/products';
import { IntroScreen } from './IntroScreen';
import { CatalogScreen, CatalogProduct } from './CatalogScreen';
import { ContactScreen } from './ContactScreen';

type Step = 'intro' | 'catalog' | 'contact';

export function DiagnosticApp() {
  // Prefetch products early
  useQuery({
    queryKey: ['products-funnel'],
    queryFn: fetchProductsFromDB,
    staleTime: 5 * 60 * 1000,
  });

  const [step, setStep] = useState<Step>('intro');
  const [selectedProducts, setSelectedProducts] = useState<CatalogProduct[]>([]);
  const { startBGM, fadeOutBGM, playClickSFX, playTransitionSFX, playCelebrationSFX } = useAudio();

  const handleStart = useCallback(() => {
    startBGM();
    setStep('catalog');
  }, [startBGM]);

  const handleCatalogConfirm = useCallback((products: CatalogProduct[]) => {
    playTransitionSFX();
    setSelectedProducts(products);
    setStep('contact');
  }, [playTransitionSFX]);

  const handleCelebrate = useCallback(() => {
    playCelebrationSFX();
    fadeOutBGM(8);
  }, [playCelebrationSFX, fadeOutBGM]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="noise-overlay" />
      <div className="relative z-10">
        {step === 'intro' && <IntroScreen onStart={handleStart} />}
        {step === 'catalog' && (
          <CatalogScreen onConfirm={handleCatalogConfirm} onClickSFX={playClickSFX} />
        )}
        {step === 'contact' && (
          <ContactScreen selectedProducts={selectedProducts} onCelebrate={handleCelebrate} />
        )}
      </div>
    </div>
  );
}
