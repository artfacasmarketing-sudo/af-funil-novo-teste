import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitLeadSimplified } from '@/lib/supabaseLeadService';
import { Loader2, CheckCircle2, AlertCircle, MessageCircle, ShoppingBag } from 'lucide-react';
import { LogoHeader } from './LogoHeader';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { trackLeadServer } from '@/lib/metaConversions';
import { useMetaCookies } from '@/contexts/MetaCookieContext';
import { CelebrationEffect } from './CelebrationEffect';
import { CatalogProduct } from './CatalogScreen';

interface ContactScreenProps {
  selectedProducts: CatalogProduct[];
  onCelebrate?: () => void;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ContactScreen({ selectedProducts, onCelebrate }: ContactScreenProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [showCelebration, setShowCelebration] = useState(false);

  const { trackLead } = useMetaPixel();
  const { fbp, fbc } = useMetaCookies();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (submitState === 'success') {
      setShowCelebration(true);
      onCelebrate?.();
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [submitState, onCelebrate]);

  const totalEstimate = selectedProducts.reduce(
    (sum, p) => sum + p.avgPrice * p.quantity, 0
  );

  const validateWhatsapp = (value: string): boolean => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
      setWhatsappError('Número inválido. Informe o DDD + número (mínimo 10 dígitos).');
      return false;
    }
    if (digits.length > 15) {
      setWhatsappError('Número muito longo.');
      return false;
    }
    setWhatsappError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) { alert('Por favor, preencha seu nome.'); return; }
    if (!whatsapp.trim()) { setWhatsappError('WhatsApp é obrigatório.'); return; }
    if (!validateWhatsapp(whatsapp)) return;

    setSubmitState('loading');

    try {
      const result = await submitLeadSimplified(
        { name, whatsapp, email, company },
        selectedProducts
      );

      if (result.success && result.lead_id) {
        const eventId = result.lead_id;
        trackLead({ eventId, email: email || undefined, phone: whatsapp, value: totalEstimate });

        const nameParts = name.trim().split(/\s+/);
        await trackLeadServer({
          eventId,
          email: email || undefined,
          phone: whatsapp,
          value: totalEstimate,
          externalId: eventId,
          eventSourceUrl: window.location.href,
          fbp, fbc,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || undefined,
          country: 'br',
        });

        setSubmitState('success');
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  };

  // Success
  if (submitState === 'success') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
        <LogoHeader />
        {showCelebration && <CelebrationEffect />}
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <div className="w-full max-w-md space-y-6 animate-scale-in text-center">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center animate-glow-pulse">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Perfeito!</h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                Recebemos seu pedido e um especialista AF vai te chamar no WhatsApp para finalizar o orçamento.
              </p>
            </div>
            <div className="pt-4">
              <a
                href="https://api.whatsapp.com/send?phone=5562999993577"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Iniciar conversa no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (submitState === 'error') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
        <LogoHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <div className="w-full max-w-md space-y-6 animate-scale-in text-center">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ops!</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Tivemos uma instabilidade. Por favor, tente novamente.
              </p>
            </div>
            <Button onClick={() => setSubmitState('idle')} size="lg" className="w-full max-w-xs rounded-2xl py-6 font-semibold glow-hover">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
      <LogoHeader />
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-scale-in">
          {/* Budget summary */}
          <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Resumo do pedido
            </div>
            <div className="space-y-2">
              {selectedProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {p.name} <span className="mono-font">×{p.quantity}</span>
                  </span>
                  <span className="font-medium mono-font">
                    {formatCurrency(p.avgPrice * p.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total estimado</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalEstimate)}</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Fale com um especialista
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Preencha abaixo e o especialista AF te chama no WhatsApp com o orçamento final.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo *"
              className="bg-secondary border-border py-6 text-base"
              disabled={submitState === 'loading'}
            />
            <div className="space-y-1">
              <Input
                type="tel"
                value={whatsapp}
                onChange={(e) => { setWhatsapp(e.target.value); if (whatsappError) setWhatsappError(''); }}
                placeholder="WhatsApp (DDD) *"
                className={`bg-secondary border-border py-6 text-base ${whatsappError ? 'border-destructive' : ''}`}
                disabled={submitState === 'loading'}
              />
              {whatsappError && <p className="text-destructive text-xs">{whatsappError}</p>}
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail (opcional)"
              className="bg-secondary border-border py-6 text-base"
              disabled={submitState === 'loading'}
            />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nome da empresa (opcional)"
              className="bg-secondary border-border py-6 text-base"
              disabled={submitState === 'loading'}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={submitState === 'loading'}
            className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
          >
            {submitState === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Solicitar orçamento'
            )}
          </Button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 pb-8 opacity-15">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
            <span className="text-[8px] uppercase tracking-[0.25em] font-semibold">
              AF Brindes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
