

## Plano: Corrigir CORS para funcionar no preview e em produção

### Problema identificado

A edge function `submit-lead` usa o secret `ALLOWED_ORIGIN` (configurado como `https://consultoria-afbrindes.com`) no header `Access-Control-Allow-Origin`. Quando o app roda no preview do Lovable (`*.lovable.app`), o browser bloqueia a resposta por CORS mismatch.

### Solução

**Arquivo: `supabase/functions/submit-lead/index.ts`**

Alterar a lógica de CORS para aceitar múltiplas origens de forma segura:
- Ler `ALLOWED_ORIGIN` como antes (produção)
- Verificar o header `Origin` da request
- Se bater com a origem permitida OU com `*.lovable.app`, usar essa origem no `Access-Control-Allow-Origin`
- Caso contrário, usar a origem configurada (produção)
- Isso mantém a segurança (não usa `*`) mas permite o preview funcionar

```typescript
const ALLOWED_ORIGINS = [
  Deno.env.get('ALLOWED_ORIGIN'),
  // Preview domains
].filter(Boolean) as string[];

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  // Allow production domain
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow Lovable preview domains
  if (origin.endsWith('.lovable.app')) return origin;
  // Fallback
  return ALLOWED_ORIGINS[0] || '*';
}
```

Atualizar `corsHeaders` para ser dinâmico (construído a cada request com a origem correta).

**Mesma correção em `supabase/functions/meta-conversions/index.ts`** se também usar `ALLOWED_ORIGIN`.

### Resultado
O fluxo completo (catálogo → contato → upload → submit) funcionará tanto no preview quanto em produção.

