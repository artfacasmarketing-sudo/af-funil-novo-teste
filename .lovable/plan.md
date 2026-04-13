

## Plano: Adicionar seleção de cores ao fluxo do catálogo

### Contexto
Os produtos já possuem dados de `colors` e `color_images` no banco. O fluxo simplificado (catálogo direto) atualmente não coleta preferência de cores — envia `colors: { selected: [] }` no lead. O usuário quer uma etapa de seleção de cores, simplificada, para que:
1. O cliente escolha as cores desejadas
2. Os cards dos produtos mostrem a imagem da cor selecionada (quando disponível)
3. As cores escolhidas sejam enviadas no lead

### Alterações

**1. `src/components/diagnostic/CatalogScreen.tsx`**
- Adicionar uma seção de seleção de cores **acima da grade de produtos**, logo após os filtros de categoria
- Usar as mesmas `colorOptions` de `src/data/questions.ts` (13 cores com hex)
- UI: linha horizontal de bolinhas coloridas (chips circulares), multi-select, com borda destacada quando selecionado
- Estado: `selectedColors: Set<string>` (ids como `black`, `blue`, etc.)
- Quando há cores selecionadas, trocar a imagem do card do produto pela `color_images[cor]` se disponível
- Atualizar `CatalogProduct` para incluir `selectedColors` no export, ou passar as cores como dado separado no `onConfirm`

**2. `src/components/diagnostic/CatalogScreen.tsx` — Card do produto**
- Usar lógica similar ao `ProductSelectionScreen`: se `product.color_images[selectedColor]` existe, mostrar essa imagem
- Prioridade: primeira cor selecionada que tenha imagem disponível no produto

**3. `src/components/diagnostic/DiagnosticApp.tsx`**
- Atualizar `handleCatalogConfirm` para receber as cores selecionadas junto com os produtos
- Passar `selectedColors` para `ContactScreen`

**4. `src/components/diagnostic/ContactScreen.tsx`**
- Receber `selectedColors: string[]` como prop
- Passar para `submitLeadSimplified`

**5. `src/lib/supabaseLeadService.ts`**
- Atualizar `submitLeadSimplified` para aceitar `selectedColors: string[]`
- Preencher `colors: { brand_colors: false, selected: selectedColors.map(id => colorLabels[id] || id), codes: '' }` no payload

**Visual dos chips de cor:**
```text
🎨 Cores desejadas (opcional)
[⚫] [⚪] [🔵] [🔴] [🟢] [🟡] [🟠] [🟣] [🩷] [🟤] [🥇] [⬜]
```
Cada chip é um círculo com a cor `hex`, borda `ring-2 ring-primary` quando selecionado, e label abaixo em texto pequeno.

### Resultado
O cliente seleciona suas cores preferidas, vê os produtos na cor escolhida (quando disponível), e o lead chega com as cores informadas.

