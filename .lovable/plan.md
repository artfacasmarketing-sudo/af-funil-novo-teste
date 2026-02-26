

## Plano: Remover loader e ir direto aos produtos com transição suave

### Abordagem

Remover o loader e o delay mínimo. Em vez disso, fazer **prefetch dos produtos desde o início do diagnóstico** (no `DiagnosticApp`) para que quando o usuário chegar na vitrine, os dados já estejam prontos. O carrossel renderiza direto com `animate-fade-in` para uma entrada suave.

### Mudanças

**1. `src/components/diagnostic/DiagnosticApp.tsx`**
- Adicionar `useQuery` com `prefetchQuery` ou simplesmente um `useQuery` para `['products-funnel']` no componente raiz, disparando o fetch logo no mount. Assim os produtos já estarão em cache quando o `ProductSelectionScreen` montar.

**2. `src/components/diagnostic/ProductSelectionScreen.tsx`**
- Remover estado `minDelayPassed` e o `useEffect` do timer
- Remover a condicional `(isLoading || !minDelayPassed)` e o bloco do loader
- Renderizar o carrossel direto (os dados já estarão em cache pelo prefetch)
- Manter um fallback mínimo para o caso raro de loading: mostrar apenas o carrossel vazio com o mesmo espaço (sem spinner, sem texto), para não quebrar o layout

### Resultado
O usuário vai direto do último question para a vitrine de produtos sem nenhum loader intermediário. Os produtos já estarão carregados em cache.

