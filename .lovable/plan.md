

## Plano: Corrigir erro de CORS nas Edge Functions

### Problema identificado

Testei a edge function `submit-lead` diretamente e ela funciona perfeitamente (retorna `success: true`). O problema é que o browser bloqueia a resposta por **CORS incompleto**.

As funções `submit-lead` e `meta-conversions` não incluem o header `Access-Control-Allow-Methods` na resposta do preflight (`OPTIONS`). Alguns browsers exigem esse header para permitir requisições `POST`. Sem ele, o `supabase.functions.invoke()` retorna um erro opaco (provavelmente o "erro na ID Fusion" que você está vendo).

### Solução

**Arquivo: `supabase/functions/submit-lead/index.ts`**
- Adicionar `'Access-Control-Allow-Methods': 'POST, OPTIONS'` ao `getCorsHeaders()`
- Importar `corsHeaders` do SDK do Supabase (padrão recomendado) OU adicionar o header manualmente

**Arquivo: `supabase/functions/meta-conversions/index.ts`**
- Mesma correção: adicionar `Access-Control-Allow-Methods`

**Arquivo: `src/components/diagnostic/ContactScreen.tsx`**
- Tornar `trackLeadServer` fire-and-forget (não aguardar resposta), para que um eventual erro no Meta Conversions não bloqueie a tela de sucesso

### Alterações específicas

Nos dois edge functions, a função `getCorsHeaders` passará a retornar:

```typescript
return {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

No `ContactScreen.tsx`, a chamada `trackLeadServer` será feita sem `await`:

```typescript
// Fire-and-forget: não bloqueia a UI
trackLeadServer({ ... }).catch(() => {});
setSubmitState('success'); // mostra sucesso imediatamente
```

### Deploy
- Re-deploy das duas edge functions
- Teste com `curl_edge_functions` para validar

