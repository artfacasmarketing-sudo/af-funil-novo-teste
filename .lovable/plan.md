

## Plano: Corrigir bugs de carregamento na vitrine de produtos

### Problemas identificados

1. **Produtos "atrasados"**: A vitrine usa `useQuery` para buscar produtos do banco, mas enquanto carrega, usa o array estático local (desatualizado). Quando os dados do banco chegam, a lista muda abruptamente causando flash visual.

2. **Scroll infinito quebra na troca de dados**: Quando `dbProducts` chega do banco e substitui os dados estáticos, `singleBlockWidth` e a posição do scroll ficam dessincronizados, causando comportamento errático no carrossel.

3. **Sem estado de loading**: Nenhum skeleton/spinner enquanto os produtos estão sendo buscados do banco.

### Correções

**Arquivo:** `src/components/diagnostic/ProductSelectionScreen.tsx`

1. Adicionar estado de loading com skeletons enquanto produtos carregam do banco
2. Só renderizar o carrossel depois que `dbProducts` estiver pronto (evita dupla renderização)
3. Resetar `singleBlockWidth` e `mounted` quando `filteredProducts` muda, garantindo re-inicialização correta do scroll infinito

### Detalhes tecnicos

- Usar `isLoading` do `useQuery` para mostrar skeleton cards no lugar do carrossel vazio
- Condicionar a renderização do carrossel a `!isLoading` para evitar que o scroll infinito se inicialize com dados temporários e depois quebre ao receber os dados finais
- Adicionar `key={filteredProducts.length}` no container do scroll para forçar re-mount quando a lista de produtos muda
- Resetar `mounted.current = false` no useEffect de inicialização do scroll

