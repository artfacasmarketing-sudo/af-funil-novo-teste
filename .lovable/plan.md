

## Plano: Adicionar seletor de cores clássico na tela de contato

Vou adicionar o seletor de cores igual ao que existia no fluxo antigo (`QuestionRenderer.tsx`) dentro do `ContactScreen.tsx`, entre o upload de logo e o botão de enviar.

### Alterações

**1. `src/components/diagnostic/ContactScreen.tsx`**
- Importar `colorOptions` de `src/data/questions.ts` e `Checkbox` do UI
- Adicionar 3 estados: `selectedColors: string[]`, `brandFlag: boolean`, `customHex: string`
- Inserir seção após o upload de logo com:
  - Grid de bolinhas coloridas (mesmo layout: `grid-cols-4 sm:grid-cols-5 md:grid-cols-7`), multi-select com `ring-2 ring-primary` quando ativo, borda sutil no preto
  - Checkbox "Quero usar as cores da minha marca"
  - Input para códigos HEX / Pantone
- Tornar seleção de cores **opcional** (não bloqueia envio)
- Passar `selectedColors`, `brandFlag`, `customHex` para `submitLeadSimplified`

**2. `src/lib/supabaseLeadService.ts`**
- Atualizar `submitLeadSimplified` para aceitar parâmetro de cores: `{ selectedColors, brandFlag, customHex }`
- Preencher campo `colors` no payload: `{ brand_colors: brandFlag, selected: [...labels], codes: customHex }`

### Visual
```text
🎨 Cores da campanha (opcional)
[⚫] [⚪] [⬜] [🔵] [🔴] [🟢] [🟡] [🟠] [🟣] [🩷] [🟤] [🥇] [⬜]

☐ Quero usar as cores da minha marca
[ #1A2B3C / Pantone 300C...            ]

[Solicitar orçamento]
```

