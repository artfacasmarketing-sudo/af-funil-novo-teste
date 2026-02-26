

## Plano: Garantir tempo mínimo de 1s no loader de produtos

### Mudança

**Arquivo:** `src/components/diagnostic/ProductSelectionScreen.tsx`

Adicionar um estado `minDelayPassed` que começa `false` e vira `true` após 1 segundo. O loader só desaparece quando **ambos** `!isLoading` e `minDelayPassed` forem verdadeiros.

### Implementação

1. Adicionar estado: `const [minDelayPassed, setMinDelayPassed] = useState(false);`
2. Adicionar useEffect com `setTimeout(() => setMinDelayPassed(true), 1000)`
3. Trocar a condição do loader de `isLoading` para `isLoading || !minDelayPassed`

