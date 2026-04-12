

## Plano: Simplificar o funil para catálogo gamificado

### Novo fluxo (3 telas)

```text
Intro → Catálogo (produtos + quantidade) → Orçamento + Formulário de contato
```

Remove completamente: 10 perguntas do funil, tela de processing, tela de results, seleção de cores, upload de logo.

### O que muda

**1. DiagnosticApp.tsx** — Reescrever o fluxo
- Steps reduzidos para: `intro | catalog | contact`
- Remover estados de questions, responses, results, brandFiles, selectedPath, currentQuestionIndex
- Manter apenas: `selectedProducts` (agora com quantidade) e step
- Intro → Catálogo → Contato (com orçamento embutido)

**2. Novo componente: CatalogScreen.tsx**
- Mostra TODOS os produtos do banco (sem filtro por categoria)
- Cada produto tem card com imagem, nome, preço médio unitário e um campo de quantidade (input numérico, mínimo 1)
- Ao selecionar um produto, aparece o campo de quantidade (default 1)
- Exibe orçamento estimado total em tempo real na parte inferior (soma de preço_médio × quantidade para cada produto selecionado)
- Preço médio = (price_min + price_max) / 2
- Botão "Continuar" habilitado quando ao menos 1 produto selecionado

**3. Novo componente: ContactScreen.tsx** (simplificação do CaptureScreen)
- Mostra resumo do orçamento estimado no topo (lista dos produtos + qtd + total)
- Formulário simplificado: nome, WhatsApp, email (opcional), empresa (opcional)
- Remove: CPF/CNPJ, inscrição estadual, agendamento, seleção de preferência
- Mantém: submissão via edge function submit-lead, tracking Meta Pixel, tela de sucesso/erro
- Envia os produtos selecionados com quantidades no payload

**4. Atualizar tipos e serviço**
- `SelectedProduct` ganha campo `quantity: number`
- `supabaseLeadService.ts` — simplificar payload (sem goal, occasion, audience, etc.) — enviar produtos com quantidade
- Webhook continua recebendo os dados via edge function

**5. Arquivos que ficam sem uso** (podem ser removidos ou mantidos)
- FunnelScreen, QuestionRenderer, ProcessingScreen, ResultsScreen, resultsCalculator.ts
- Não serão importados mais, mas remoção é opcional

### Resultado
Cliente chega, vê a intro, navega pelo catálogo de produtos, seleciona os que quer com quantidades, vê o orçamento estimado em tempo real, e preenche os dados para falar com o especialista.

