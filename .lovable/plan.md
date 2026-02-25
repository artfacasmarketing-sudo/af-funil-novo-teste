

## Revisao de seguranca pre-lancamento

Analisei todo o backend, edge functions, RLS, storage e frontend. Aqui esta o estado atual e o que recomendo corrigir antes de publicar.

---

### Estado atual: o que JA esta bem feito

- **RLS na tabela `leads`**: INSERT publico (necessario para o funil), SELECT/UPDATE/DELETE bloqueados. Correto.
- **RLS na tabela `products`**: SELECT publico, INSERT/UPDATE/DELETE bloqueados. Admin usa service_role via edge function. Correto.
- **Bucket `brand-files`**: Privado, nomes UUID, signed URLs de 7 dias. Correto.
- **Validacao Zod server-side** no `submit-lead`: Schema completo com limites de tamanho. Correto.
- **Rate limiting** em todas as 3 edge functions. Funcional (limitacao: reset no cold start, risco aceitavel).
- **Admin protegido por senha** via secret `ADMIN_PASSWORD` no edge function.
- **Meta Conversions**: PII hasheado com SHA-256, tokens no server-side. Correto.

---

### Problemas para corrigir ANTES do lancamento

#### 1. `.env` nao esta no `.gitignore` (risco: MEDIO)

O arquivo `.gitignore` nao exclui `.env`. Hoje so tem chaves publicas (anon key, URL), mas qualquer secret adicionado no futuro sera commitado no historico git.

**Correcao**: Adicionar `.env` e variantes ao `.gitignore`.

#### 2. Console logs excessivos no frontend (risco: BAIXO)

O codigo loga payloads completos, lead IDs, cookies `_fbp`/`_fbc`, IPs e URLs de arquivos no console do navegador. Qualquer usuario pode ver via DevTools.

**Correcao**: Envolver todos os `console.log` em condicional `import.meta.env.DEV` nos arquivos:
- `src/lib/supabaseLeadService.ts` (linhas 149, 254, 265)
- `src/components/diagnostic/CaptureScreen.tsx` (linhas 140, 142, 168, 184-186, 205, 208, 212)
- `src/contexts/MetaCookieContext.tsx` (linhas 35, 40, 67)
- `src/hooks/useMetaPixel.ts`

#### 3. `meta-conversions` nao valida input com Zod (risco: BAIXO-MEDIO)

A edge function `meta-conversions` faz `await req.json()` direto sem schema validation, diferente do `submit-lead` que usa Zod. Um atacante pode enviar payloads malformados.

**Correcao**: Adicionar schema Zod na `meta-conversions` similar ao `submit-lead`.

#### 4. `admin-products` nao valida dados de entrada (risco: BAIXO)

A edge function aceita qualquer `data` sem validacao. Como eh protegida por senha, o risco eh baixo, mas dados malformados podem causar erros no banco.

**Correcao**: Adicionar validacao basica dos campos no `admin-products`.

---

### Problemas aceitos (nao bloquear lancamento)

- **Rate limit in-memory**: Reset no cold start eh limitacao inerente de serverless. O rate limit funciona durante periodos ativos. Aceitavel.
- **RLS `WITH CHECK (true)` no INSERT de leads**: Intencional para formulario publico. O rate limit + validacao Zod protegem contra spam.
- **Sem admin auth com roles**: O admin usa senha simples via edge function, nao auth completo. Aceitavel para o caso de uso atual.

---

### Plano de implementacao (itens 1-4)

1. **`.gitignore`**: Adicionar `.env`, `.env.local`, `.env.*.local`
2. **Console logs**: Criar helper `devLog()` ou envolver em `import.meta.env.DEV` nos 4 arquivos do frontend
3. **`meta-conversions`**: Adicionar schema Zod para validar `event_name`, `event_id`, campos opcionais
4. **`admin-products`**: Adicionar validacao basica nos campos `name`, `sku`, `price_min`, `price_max`

### Detalhes tecnicos

**Arquivos modificados:**
- `.gitignore` (3 linhas adicionadas)
- `src/lib/supabaseLeadService.ts` (wrapping logs)
- `src/components/diagnostic/CaptureScreen.tsx` (wrapping logs)
- `src/contexts/MetaCookieContext.tsx` (wrapping logs)
- `src/hooks/useMetaPixel.ts` (wrapping logs)
- `supabase/functions/meta-conversions/index.ts` (adicionar Zod schema)
- `supabase/functions/admin-products/index.ts` (adicionar validacao)

