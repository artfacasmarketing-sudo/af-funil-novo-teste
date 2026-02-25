import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrustedBrandsMarquee } from './TrustedBrandsMarquee';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import logoAf from '@/assets/logo-af.png';

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const { trackInitiateCheckout } = useMetaPixel();

  const handleStart = () => {
    // Track InitiateCheckout event
    trackInitiateCheckout();
    onStart();
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl text-center space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Logo AF Brindes */}
          <div className="flex justify-center mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <img 
              src={logoAf} 
              alt="AF Brindes Logo" 
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] object-contain"
            />
          </div>

          {/* Pill */}
          <div className="inline-block">
            <span className="px-4 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] bg-primary/10 border border-primary/30 rounded-full text-primary">
              AF Brindes - Artfacas Brasil
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            O brinde certo transforma a{' '}
            <span className="text-primary">percepção da sua marca.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-md mx-auto leading-relaxed">
            Descubra, em poucos minutos, quais brindes fazem mais sentido para o seu evento, público e orçamento.
          </p>

          {/* CTA Button */}
          <div className="pt-4 sm:pt-6">
            <Button
              onClick={handleStart}
              size="lg"
              className="max-w-sm w-full rounded-2xl text-base sm:text-lg font-semibold py-6 sm:py-7 glow-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Iniciar diagnóstico
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 pt-6 sm:pt-8 opacity-40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold">
                Qualidade AF
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold">
                Consultoria Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Brands Marquee - fixed at bottom */}
      <TrustedBrandsMarquee />
    </div>
  );
}
