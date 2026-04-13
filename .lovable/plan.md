

## Plano: Garantir envio completo do orçamento + documento obrigatório

### Problema atual
- O `selected_products` no Zod da edge function só aceita `{ name, sku }` — os campos `quantity` e `unit_price` são descartados silenciosamente pela validação
- O campo de documento está marcado como opcional no frontend e no backend

### Alterações

**1. `supabase/functions/submit-lead/index.ts`** — Expandir schema do Zod

- Alterar o schema de `selected_products` para aceitar objetos com `name`, `sku`, `quantity` e `unit_price`:
  ```
  z.object({ name, sku, quantity (optional number), unit_price (optional number) })
  ```
- Tornar `document_type` e `document_number` obrigatórios (remover `.optional().nullable()`)

**2. `src/components/diagnostic/ContactScreen.tsx`** — Documento obrigatório com validação

- Remover label "(opcional)" do documento
- Adicionar validação no `handleSubmit`:
  - Bloquear envio se `documentNumber` estiver vazio
  - Validar CPF = 11 dígitos / CNPJ = 14 dígitos
  - Mostrar erro inline abaixo do campo
- Adicionar estado `documentError` para feedback visual

**3. `src/lib/supabaseLeadService.ts`** — Já envia `quantity` e `unit_price` (sem mudança necessária)

A linha 316 já mapeia `{ name, sku, quantity, unit_price }` — o problema é só o Zod na edge function que descarta os campos extras.

### Detalhes técnicos
- A tabela `leads` armazena `selected_products` como `ARRAY/jsonb`, então os campos extras são salvos automaticamente sem migração
- O webhook n8n já recebe o payload completo incluindo `selected_products` com todos os campos
- A edge function precisa ser re-deployada após a alteração do schema

