import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { submitLeadSimplified, uploadBrandFiles } from '@/lib/supabaseLeadService';
import { Loader2, CheckCircle2, AlertCircle, MessageCircle, ShoppingBag, Upload, X, FileIcon } from 'lucide-react';
import { colorOptions } from '@/data/questions';
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

const MAX_FILES = 10;

export function ContactScreen({ selectedProducts, onCelebrate }: ContactScreenProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [brandFlag, setBrandFlag] = useState(false);
  const [customHex, setCustomHex] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const remaining = MAX_FILES - files.length;
    const toAdd = selected.slice(0, remaining);
    if (toAdd.length > 0) {
      setFiles(prev => [...prev, ...toAdd]);
      setFileError('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { alert('Por favor, preencha seu nome.'); return; }
    if (!whatsapp.trim()) { setWhatsappError('WhatsApp é obrigatório.'); return; }
    if (!validateWhatsapp(whatsapp)) return;
    if (files.length === 0) {
      setFileError('Envie pelo menos um arquivo com a logo da sua marca.');
      return;
    }

    setSubmitState('loading');
    setErrorMessage(null);

    try {
      // Upload files first
      let fileUrls: string[];
      try {
        fileUrls = await uploadBrandFiles(files);
      } catch (uploadErr: any) {
        setErrorMessage(uploadErr.message || 'Falha no upload dos arquivos.');
        setSubmitState('error');
        return;
      }

      const result = await submitLeadSimplified(
        { name, whatsapp, email, company },
        selectedProducts,
        fileUrls,
        { selectedColors, brandFlag, customHex }
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
        setErrorMessage(result.error || 'Erro ao enviar. Tente novamente.');
        setSubmitState('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado. Tente novamente.');
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
                {errorMessage || 'Tivemos uma instabilidade. Por favor, tente novamente.'}
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

            {/* Logo upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Upload className="w-4 h-4 text-primary" />
                Envie a logo da sua marca <span className="text-destructive">*</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitState === 'loading' || files.length >= MAX_FILES}
                className="w-full rounded-xl border-2 border-dashed border-border bg-secondary/50 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Selecionar arquivos
                <br />
                <span className="text-xs">PNG, JPG, WebP ou PDF (máx 5MB cada)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <div className="space-y-1.5">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                      <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {fileError && <p className="text-destructive text-xs">{fileError}</p>}
              {files.length === 0 && !fileError && (
                <p className="text-muted-foreground text-xs">Obrigatório para montarmos o orçamento personalizado</p>
              )}
            </div>

            {/* Color picker */}
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                🎨 Cores da campanha (opcional)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 sm:gap-4 py-2">
                {colorOptions.map(color => {
                  const isSelected = selectedColors.includes(color.id);
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColors(prev =>
                        prev.includes(color.id)
                          ? prev.filter(c => c !== color.id)
                          : [...prev, color.id]
                      )}
                      className="group flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-200"
                      disabled={submitState === 'loading'}
                    >
                      <div
                        className={`
                          w-12 h-12 sm:w-11 sm:h-11 rounded-full transition-all duration-200
                          ${color.id === 'black' ? 'border border-zinc-600' : ''}
                          ${isSelected
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            : 'hover:scale-105 active:scale-95'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {color.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="brand-flag"
                  checked={brandFlag}
                  onCheckedChange={(checked) => setBrandFlag(checked === true)}
                  className="mt-0.5"
                  disabled={submitState === 'loading'}
                />
                <label htmlFor="brand-flag" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Quero usar as cores da minha marca (enviar depois)
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                  Possui códigos específicos? (HEX / Pantone)
                </label>
                <Input
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#1A2B3C / Pantone 300C..."
                  className="bg-secondary border-border py-6 text-base"
                  disabled={submitState === 'loading'}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={submitState === 'loading' || files.length === 0}
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
