import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { useMetaCookies } from '@/contexts/MetaCookieContext';
import { trackLeadServer } from '@/lib/metaConversions';
import { submitLeadSimplified } from '@/lib/supabaseLeadService';
import type { LandingProduct } from '@/data/landingProducts';

const onlyDigits = (s: string) => s.replace(/\D/g, '');

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo').max(100),
  whatsapp: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v.length >= 10 && v.length <= 15, 'WhatsApp inválido (com DDD)'),
  email: z.string().trim().email('E-mail inválido').max(255),
  company: z.string().trim().min(2, 'Informe a empresa').max(120),
  quantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).int().min(1, 'Mínimo 1 unidade'),
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string().transform(onlyDigits),
  stateRegistration: z.string().trim().max(40).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  const len = data.documentNumber.length;
  if (data.documentType === 'cpf' && len !== 11) {
    ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CPF deve ter 11 dígitos' });
  }
  if (data.documentType === 'cnpj' && len !== 14) {
    ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CNPJ deve ter 14 dígitos' });
  }
});

function maskWhatsapp(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCnpj(v: string) {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

interface LandingFormProps {
  product: LandingProduct;
}

export function LandingForm({ product }: LandingFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackLead } = useMetaPixel();
  const { fbp, fbc } = useMetaCookies();

  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>('cnpj');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    company: '',
    quantity: String(product.minQty),
    documentNumber: '',
    stateRegistration: '',
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (k === 'whatsapp') v = maskWhatsapp(v);
    else if (k === 'documentNumber') v = docType === 'cpf' ? maskCpf(v) : maskCnpj(v);
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, documentType: docType });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      toast({ title: 'Verifique os campos', description: 'Há campos inválidos no formulário.', variant: 'destructive' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const data = parsed.data;
      const result = await submitLeadSimplified(
        {
          name: data.name,
          whatsapp: data.whatsapp,
          email: data.email,
          company: data.company,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          stateRegistration: data.stateRegistration || undefined,
        },
        [
          {
            id: product.slug,
            name: product.name,
            sku: product.sku,
            quantity: data.quantity,
            avgPrice: product.unitPriceFrom,
          },
        ],
        [],
      );

      if (!result.success || !result.lead_id) {
        throw new Error(result.error || 'Falha ao enviar. Tente novamente.');
      }

      const totalValue = data.quantity * product.unitPriceFrom;
      trackLead({ eventId: result.lead_id, email: data.email, phone: data.whatsapp, value: totalValue });
      const [firstName, ...rest] = data.name.split(' ');
      void trackLeadServer({
        eventId: result.lead_id,
        email: data.email,
        phone: data.whatsapp,
        value: totalValue,
        externalId: result.lead_id,
        eventSourceUrl: window.location.href,
        fbp,
        fbc,
        firstName,
        lastName: rest.join(' ') || undefined,
        country: 'br',
      });

      navigate(`/obrigado?p=${encodeURIComponent(product.slug)}`);
    } catch (err: any) {
      toast({
        title: 'Não foi possível enviar',
        description: err?.message || 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome completo" error={errors.name}>
          <Input value={form.name} onChange={update('name')} placeholder="Seu nome" autoComplete="name" />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp}>
          <Input
            value={form.whatsapp}
            onChange={update('whatsapp')}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="voce@empresa.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Empresa" error={errors.company}>
          <Input value={form.company} onChange={update('company')} placeholder="Nome da empresa" autoComplete="organization" />
        </Field>
        <Field label="Quantidade desejada" error={errors.quantity}>
          <Input
            type="number"
            min={1}
            value={form.quantity}
            onChange={update('quantity')}
            placeholder={`Mín. ${product.minQty}`}
            inputMode="numeric"
          />
        </Field>
        <div className="space-y-2">
          <Label>Tipo de documento</Label>
          <RadioGroup
            value={docType}
            onValueChange={(v) => {
              setDocType(v as 'cpf' | 'cnpj');
              setForm((f) => ({ ...f, documentNumber: '', stateRegistration: '' }));
            }}
            className="flex gap-6 pt-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="cnpj" id="lf-cnpj" />
              <span>CNPJ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="cpf" id="lf-cpf" />
              <span>CPF</span>
            </label>
          </RadioGroup>
        </div>
        <Field label={docType === 'cpf' ? 'CPF' : 'CNPJ'} error={errors.documentNumber}>
          <Input
            value={form.documentNumber}
            onChange={update('documentNumber')}
            placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
            inputMode="numeric"
          />
        </Field>
        {docType === 'cnpj' && (
          <Field label="Inscrição Estadual (opcional)" error={errors.stateRegistration}>
            <Input
              value={form.stateRegistration}
              onChange={update('stateRegistration')}
              placeholder="Se houver"
            />
          </Field>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Enviando...
          </>
        ) : (
          'Quero meu orçamento personalizado'
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Ao enviar, você concorda em receber um contato comercial pelo WhatsApp.
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
