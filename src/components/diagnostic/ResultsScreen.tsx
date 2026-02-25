import { useEffect, useRef } from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagnosticResults } from '@/lib/resultsCalculator';
import { LogoHeader } from './LogoHeader';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { trackViewContentServer } from '@/lib/metaConversions';

interface ResultsScreenProps {
  results: DiagnosticResults;
  onPathSelected: (pathTitle: string) => void;
}

export function ResultsScreen({ results, onPathSelected }: ResultsScreenProps) {
  const { trackViewContent } = useMetaPixel();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const eventId = trackViewContent('Resultados do Diagnóstico', results.direction);
    
    if (eventId) {
      trackViewContentServer(eventId, 'Resultados do Diagnóstico', results.direction);
    }
  }, [results.direction, trackViewContent]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 py-8 sm:py-12">
      <LogoHeader />
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Header Card */}
        <div className="premium-card bg-card border border-border rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                Projeto em andamento
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Sua estratégia está pronta
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-full self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] sm:text-xs font-semibold text-primary">Fila prioritária</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Objetivo</p>
              <p className="font-semibold text-sm sm:text-base">{results.objective}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Público</p>
              <p className="font-semibold text-sm sm:text-base">{results.audience}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Escala</p>
              <p className="font-semibold text-sm sm:text-base">{results.scale} presentes</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Direção AF</p>
              <p className="font-semibold text-primary text-sm sm:text-base">{results.direction}</p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Nosso time de designers já está preparando os layouts personalizados para o seu projeto. Em breve, um especialista AF entrará em contato para alinhar os últimos detalhes.
          </p>
        </div>

        {/* Premium Curation Section */}
        <div className="premium-card bg-card border border-border rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 animate-fade-in">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary">
              Próximos passos
            </p>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
              Receba sua curadoria personalizada
            </h3>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Ao solicitar sua curadoria, você garante atendimento prioritário. Nossa equipe vai preparar 3 opções sob medida com mockups, preços e prazos — tudo alinhado ao seu projeto.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="px-3 py-1.5 sm:py-2 bg-secondary rounded-full text-xs sm:text-sm">
              3 opções sob medida
            </span>
            <span className="px-3 py-1.5 sm:py-2 bg-secondary rounded-full text-xs sm:text-sm">
              Personalização & Embalagem
            </span>
            <span className="px-3 py-1.5 sm:py-2 bg-secondary rounded-full text-xs sm:text-sm">
              Próximos passos claros
            </span>
          </div>

          <Button
            onClick={() => onPathSelected('Curadoria Geral')}
            size="lg"
            className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Receber minha curadoria agora
          </Button>
        </div>
      </div>
    </div>
  );
}
