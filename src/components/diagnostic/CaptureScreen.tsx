import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DiagnosticResults } from '@/lib/resultsCalculator';
import { uploadBrandFiles, submitLeadToCloud } from '@/lib/supabaseLeadService';
import { Loader2, CheckCircle2, AlertCircle, MessageCircle, CalendarIcon, Video, MessageSquare } from 'lucide-react';
import { LogoHeader } from './LogoHeader';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { trackLeadServer } from '@/lib/metaConversions';
import { useMetaCookies } from '@/contexts/MetaCookieContext';
import { CelebrationEffect } from './CelebrationEffect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isWeekend, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

interface CaptureScreenProps {
  selectedPath: string;
  results: DiagnosticResults;
  responses: Record<string, any>;
  brandFiles: File[];
  selectedProducts: { id: string; name: string; sku: string }[];
  onExtraChange: (value: string) => void;
  onCelebrate?: () => void;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function CaptureScreen({ selectedPath, results, responses, brandFiles, selectedProducts, onExtraChange, onCelebrate }: CaptureScreenProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [documentNumber, setDocumentNumber] = useState('');
  const [hasStateRegistration, setHasStateRegistration] = useState<boolean | null>(null);
  const [extra, setExtra] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [presentationPreference, setPresentationPreference] = useState<'whatsapp' | 'call' | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const { trackLead } = useMetaPixel();
  const { fbp, fbc, clientIp } = useMetaCookies();

  // Trigger celebration when success
  useEffect(() => {
    if (submitState === 'success') {
      setShowCelebration(true);
      onCelebrate?.();
      
      // Hide celebration after animation completes
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [submitState, onCelebrate]);

  const handleExtraChange = (value: string) => {
    setExtra(value);
    onExtraChange(value);
  };

  // Validate WhatsApp: must have at least 10 digits (DDD + number)
  const validateWhatsapp = (value: string): boolean => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setWhatsappError('Número inválido. Informe o DDD + número (mínimo 10 dígitos).');
      return false;
    }
    if (digitsOnly.length > 15) {
      setWhatsappError('Número muito longo. Verifique o número informado.');
      return false;
    }
    setWhatsappError('');
    return true;
  };

  const handleWhatsappChange = (value: string) => {
    setWhatsapp(value);
    // Clear error when user starts typing again
    if (whatsappError) {
      setWhatsappError('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Por favor, preencha seu nome.');
      return;
    }
    
    if (!whatsapp.trim()) {
      setWhatsappError('WhatsApp é obrigatório.');
      return;
    }

    if (!validateWhatsapp(whatsapp)) {
      return;
    }

    if (documentType === 'cnpj' && !documentNumber.trim()) {
      alert('Por favor, preencha seu CNPJ.');
      return;
    }

    if (documentType === 'cnpj' && hasStateRegistration === null) {
      alert('Por favor, informe se possui Inscrição Estadual.');
      return;
    }

    if (!presentationPreference) {
      alert('Por favor, escolha como deseja receber sua curadoria.');
      return;
    }

    if (presentationPreference === 'call' && (!scheduledDate || !scheduledTime)) {
      alert('Por favor, selecione a data e horário da reunião.');
      return;
    }

    setSubmitState('loading');

    try {
      // 1. Upload brand files to storage (if any)
      let fileUrls: string[] = [];
      if (brandFiles.length > 0) {
        if (import.meta.env.DEV) console.log('[CaptureScreen] Uploading', brandFiles.length, 'files...');
        fileUrls = await uploadBrandFiles(brandFiles);
        if (import.meta.env.DEV) console.log('[CaptureScreen] Upload complete, URLs:', fileUrls);
      }

      // 2. Submit lead to edge function (saves to DB + triggers n8n)
      const result = await submitLeadToCloud(
        responses,
        {
          name,
          whatsapp,
          email,
          company,
          extra,
          documentType,
          documentNumber,
          stateRegistration: documentType === 'cnpj' ? (hasStateRegistration ? 'Sim' : 'Não') : undefined,
          presentationPreference: presentationPreference || undefined,
          scheduledDate: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : undefined,
          scheduledTime: scheduledTime || undefined,
        },
        selectedPath,
        fileUrls,
        selectedProducts
      );

      if (result.success && result.lead_id) {
        const eventId = result.lead_id; // Use lead_id as event_id for deduplication
        if (import.meta.env.DEV) console.log('[CaptureScreen] Lead submitted successfully, using lead_id as eventId:', eventId);
        
        // 3. Track Lead event in Browser (Pixel) with advanced matching
        trackLead({
          eventId,
          email: email || undefined,
          phone: whatsapp,
          value: 0,
        });
        
        // 4. Track Lead event in Server (CAPI) with full EMQ data
        // Extract first name and last name from full name
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        if (import.meta.env.DEV) {
          console.log('[CaptureScreen] Using pre-captured cookies - fbp:', fbp ? 'present' : 'absent', 'fbc:', fbc ? 'present' : 'absent', 'clientIp:', clientIp ? 'present' : 'absent');
          console.log('[CaptureScreen] EMQ params - firstName:', firstName, 'lastName:', lastName ? 'present' : 'absent', 'country: br');
        }
        
        await trackLeadServer({
          eventId,
          email: email || undefined,
          phone: whatsapp,
          value: 0,
          externalId: eventId,
          eventSourceUrl: window.location.href,
          fbp,
          fbc,
          clientIp,
          firstName,
          lastName: lastName || undefined,
          country: 'br',
        });
        
        setSubmitState('success');
      } else if (result.success) {
        // Success but no lead_id (shouldn't happen, but handle gracefully)
        if (import.meta.env.DEV) console.warn('[CaptureScreen] Lead submitted but no lead_id returned');
        setSubmitState('success');
      } else {
        if (import.meta.env.DEV) console.error('[CaptureScreen] Submission failed:', result.error);
        setSubmitState('error');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('[CaptureScreen] Unexpected error:', error);
      setSubmitState('error');
    }
  };

  const handleRetry = () => {
    setSubmitState('idle');
  };

  // Success state
  if (submitState === 'success') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
        <LogoHeader />
        {showCelebration && <CelebrationEffect />}
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-scale-in text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center animate-glow-pulse">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Perfeito!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Recebemos seu briefing e um especialista AF vai te chamar no WhatsApp para finalizar a curadoria e pedir sua logo.
            </p>
          </div>

          <div className="pt-4">
            <a 
              href="https://wa.me/5562999993577"
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

  // Error state
  if (submitState === 'error') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
        <LogoHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-scale-in text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Ops!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Tivemos uma instabilidade ao enviar seu briefing. Por favor, tente novamente.
            </p>
          </div>

          <Button
            onClick={handleRetry}
            size="lg"
            className="w-full max-w-xs rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
          >
            Tentar novamente
          </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form state (idle or loading)
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
      <LogoHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-scale-in">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Receba sua curadoria 1:1
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Preencha abaixo e o especialista AF te chama com uma seleção personalizada.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-5">
          <Input
            id="cap-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo *"
            className="bg-secondary border-border py-6 sm:py-7 text-base"
            disabled={submitState === 'loading'}
          />
          
          <div className="space-y-1">
            <Input
              id="cap-wa"
              type="tel"
              value={whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="WhatsApp (DDD) *"
              className={`bg-secondary border-border py-6 sm:py-7 text-base ${whatsappError ? 'border-destructive' : ''}`}
              disabled={submitState === 'loading'}
            />
            {whatsappError && (
              <p className="text-destructive text-xs sm:text-sm">{whatsappError}</p>
            )}
          </div>

          <Input
            id="cap-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail (opcional)"
            className="bg-secondary border-border py-6 sm:py-7 text-base"
            disabled={submitState === 'loading'}
          />
          
          <Input
            id="cap-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nome da empresa (opcional)"
            className="bg-secondary border-border py-6 sm:py-7 text-base"
            disabled={submitState === 'loading'}
          />

          {/* CPF / CNPJ selector */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDocumentType('cpf'); setHasStateRegistration(null); setDocumentNumber(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  documentType === 'cpf'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
                disabled={submitState === 'loading'}
              >
                CPF
              </button>
              <button
                type="button"
                onClick={() => setDocumentType('cnpj')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  documentType === 'cnpj'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
                disabled={submitState === 'loading'}
              >
                CNPJ
              </button>
            </div>
            {documentType === 'cnpj' && (
              <Input
                id="cap-document"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="CNPJ *"
                className="bg-secondary border-border py-6 sm:py-7 text-base"
                disabled={submitState === 'loading'}
              />
            )}
            {documentType === 'cnpj' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Possui Inscrição Estadual? *</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasStateRegistration(true)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                      hasStateRegistration === true
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                    disabled={submitState === 'loading'}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasStateRegistration(false)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                      hasStateRegistration === false
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                    disabled={submitState === 'loading'}
                  >
                    Não
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling Section */}
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-semibold">
                📋 Agende a apresentação da sua curadoria
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Escolha como prefere receber sua seleção personalizada de um especialista AF
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setPresentationPreference('whatsapp'); setScheduledDate(undefined); setScheduledTime(null); }}
                className={`flex-1 py-4 px-3 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1.5 ${
                  presentationPreference === 'whatsapp'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
                disabled={submitState === 'loading'}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Receber pelo WhatsApp</span>
                <span className="text-[10px] opacity-75 font-normal">Enviaremos direto no seu WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setPresentationPreference('call')}
                className={`flex-1 py-4 px-3 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1.5 ${
                  presentationPreference === 'call'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
                disabled={submitState === 'loading'}
              >
                <Video className="w-5 h-5" />
                <span>Reunião online</span>
                <span className="text-[10px] opacity-75 font-normal">Call exclusiva com especialista</span>
              </button>
            </div>

            {presentationPreference === 'call' && (
              <div className="space-y-3 animate-scale-in">
                {/* Date picker */}
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 bg-secondary border border-border rounded-xl py-4 px-4 text-sm text-left"
                      disabled={submitState === 'loading'}
                    >
                      <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      {scheduledDate ? (
                        <span>{format(scheduledDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                      ) : (
                        <span className="text-muted-foreground">Selecione a data da reunião *</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => { setScheduledDate(date); setCalendarOpen(false); }}
                      disabled={(date) => isBefore(date, startOfDay(new Date())) || isWeekend(date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>

                {/* Time slots */}
                {scheduledDate && (
                  <div className="space-y-2 animate-scale-in">
                    <p className="text-sm text-muted-foreground">Escolha o horário *</p>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setScheduledTime(time)}
                          className={`py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            scheduledTime === time
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                          disabled={submitState === 'loading'}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            'Receber curadoria do especialista AF'
          )}
        </Button>

        {/* Footer note */}
        <p className="text-center text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          Você não entra em lista. Seu pedido é analisado e respondido por um especialista.
        </p>
        </div>
      </div>
    </div>
  );
}
