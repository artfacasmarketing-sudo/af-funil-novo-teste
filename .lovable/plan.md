

## Plano: Corrigir fluxo de submissão end-to-end

### Problemas identificados

Analisei todo o sistema e encontrei **3 problemas** que podem causar falha silenciosa:

**1. Edge function retorna status 400/429/500 para erros**
Quando `supabase.functions.invoke()` recebe um status diferente de 200, ele coloca o resultado em `error` e `data` fica `null`. O código do cliente verifica `data?.success`, que é `undefined`, e mostra a tela de erro genérica — sem nunca mostrar a mensagem real do problema.

**2. Upload de arquivos falha silenciosamente**
`uploadBrandFiles()` usa `continue` quando um arquivo falha, retornando um array vazio. Depois, `file_urls: []` é enviado ao edge function, que rejeita com a validação Zod (`min(1)`), gerando erro 400.

**3. Sem feedback do erro real para o usuário**
O usuário só vê "Ops! Tivemos uma instabilidade" sem saber se o problema foi no upload, na validação ou na rede.

### Solução

**Arquivo: `supabase/functions/submit-lead/index.ts`**
- Todas as respostas passam a retornar **status 200** com `{ success: true/false, error?: string }` no corpo
- Isso garante que `supabase.functions.invoke()` sempre retorna `data` com a mensagem de erro legível
- Manter logs de console para debug interno

**Arquivo: `src/lib/supabaseLeadService.ts`**
- `uploadBrandFiles()`: lançar erro se nenhum arquivo foi enviado com sucesso (em vez de retornar array vazio silenciosamente)
- `submitLeadSimplified()`: propagar a mensagem de erro do edge function para o chamador

**Arquivo: `src/components/diagnostic/ContactScreen.tsx`**
- Capturar e exibir mensagens de erro específicas (ex: "Falha no upload da logo", "Dados inválidos")
- Adicionar estado `errorMessage` para mostrar na tela de erro em vez de mensagem genérica

**Arquivo: `supabase/functions/submit-lead/index.ts` — re-deploy**
- Deploy obrigatório após as alterações

### Resultado
O fluxo completo (upload → submit → webhook) funcionará corretamente, e qualquer falha mostrará uma mensagem clara ao usuário.

