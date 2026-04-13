

## Plano: Aplicar desconto por quantidade a todos os produtos

### Problema
A função `getUnitPrice` no `CatalogScreen.tsx` tem esta lógica:
```
if (price_min === price_max) return price_max; // ← sai sem desconto
```

26 produtos (chapéu, canivetes, kits, mochilas, etc.) têm `price_min = price_max`, então nunca recebem desconto por quantidade.

### Solução

**`src/components/diagnostic/CatalogScreen.tsx`** — Alterar `getUnitPrice`

Quando `price_min === price_max`, aplicar uma curva de desconto percentual padrão sobre o preço:

| Quantidade | Desconto |
|-----------|----------|
| 1-9       | 0%       |
| 10-49     | 5%       |
| 50-99     | 10%      |
| 100-499   | 15%      |
| 500-999   | 20%      |
| 1000+     | 25%      |

Assim, o chapéu de R$50 com 100 unidades mostraria ~R$42,50/un em vez de R$50 fixo.

### Arquivo alterado
- `src/components/diagnostic/CatalogScreen.tsx` (apenas a função `getUnitPrice`)

### Observação
Os percentuais acima são uma sugestão. Se preferir valores diferentes, é só informar antes de eu implementar.

