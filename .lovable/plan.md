

## Auditoria do Meta Pixel e Conversions API

### Status geral: Funcionando, com problemas pontuais a corrigir

---

### O que esta correto

1. **Pixel base code** no `index.html` - correto, com `fbq('init')` e `fbq('track', 'PageView')`
2. **Noscript fallback** no `<body>` - correto (nao no head)
3. **Deduplicacao browser/CAPI** via `event_id` - implementada corretamente para Lead e ViewContent
4. **Hashing SHA-256 server-side** dos campos PII (em, ph, fn, ln, country, external_id) - correto
5. **Advanced Matching no browser** - aplicado antes do evento Lead
6. **Cookies _fbp e _fbc** capturados e enviados ao CAPI - correto, com case sensitivity preservada
7. **action_source: 'website'** no CAPI - correto
8. **event_time em Unix timestamp** - correto
9. **Rate limiting e validacao Zod** na edge function - correto

---

### Problemas encontrados

#### 1. API Graph versao desatualizada (MEDIO)
A edge function usa `v18.0` (linha 161 do `meta-conversions/index.ts`). A versao atual recomendada e `v21.0` ou superior. Versoes antigas sao depreciadas e podem parar de funcionar.

**Correcao:** Alterar para `v21.0` em `supabase/functions/meta-conversions/index.ts`

#### 2. InitiateCheckout sem CAPI (MEDIO)
O evento `InitiateCheckout` e disparado apenas no browser (Pixel). Nao ha envio server-side (CAPI). Isso significa que ad blockers podem impedir o rastreamento desse evento. A edge function so aceita `ViewContent` e `Lead` no schema Zod.

**Correcao:**
- Adicionar `'InitiateCheckout'` ao enum da edge function
- Criar `trackInitiateCheckoutServer` em `metaConversions.ts`
- Chamar no `IntroScreen.tsx` apos o disparo do Pixel

#### 3. ViewContent CAPI sem dados de usuario (BAIXO)
O `trackViewContentServer` nao envia `fbp`, `fbc`, `event_source_url` nem IP do cliente. Isso reduz o Event Match Quality (EMQ) desse evento.

**Correcao:** Passar `fbp`, `fbc` e `eventSourceUrl` no `ResultsScreen.tsx`

#### 4. Re-init do Pixel no trackLead (BAIXO-MEDIO)
Na linha 102 do `useMetaPixel.ts`, `fbq('init', META_PIXEL_ID, advancedMatchingData)` e chamado novamente antes de cada Lead. Segundo a documentacao da Meta, o `init` com advanced matching deve ser chamado **uma unica vez** apos o init original, nao repetidamente. Chamar multiplas vezes pode causar eventos duplicados em cenarios de SPA.

**Correcao:** Remover o re-init. O advanced matching ja esta sendo enviado pelo CAPI com dados hasheados. O browser Pixel ja captura os dados via `InputData` automaticamente (visivel nos network requests).

#### 5. Telefone sem codigo de pais no CAPI (BAIXO)
O phone e enviado como `62993060670` (sem `+55`). A Meta recomenda incluir o codigo do pais para melhor matching.

**Correcao:** Prefixar `55` ao telefone no `metaConversions.ts` antes de enviar, se nao comecar com `55`.

---

### Alteracoes propostas

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/meta-conversions/index.ts` | Atualizar API para v21.0; adicionar `InitiateCheckout` ao schema Zod |
| `src/lib/metaConversions.ts` | Adicionar `trackInitiateCheckoutServer`; prefixar `55` no telefone |
| `src/components/diagnostic/IntroScreen.tsx` | Chamar CAPI para InitiateCheckout |
| `src/components/diagnostic/ResultsScreen.tsx` | Passar fbp/fbc/eventSourceUrl no ViewContent CAPI |
| `src/hooks/useMetaPixel.ts` | Remover `fbq('init')` duplicado no trackLead |

