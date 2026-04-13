

## Plano: Preço por unidade dinâmico baseado na quantidade

### Lógica de preços

Cada produto tem `price_min` (preço mais barato, para grandes quantidades) e `price_max` (preço mais caro, para poucas unidades). A lógica será:

| Quantidade | Preço unitário |
|---|---|
| 1–9 | `price_max` |
| 10–49 | interpolação 80% max / 20% min |
| 50–99 | interpolação 60% max / 40% min |
| 100–499 | interpolação 40% max / 60% min |
| 500–999 | interpolação 20% max / 80% min |
| 1000+ | `price_min` |

Para produtos onde `price_min === price_max`, o preço fica fixo independente da quantidade.

### Alterações

**Arquivo: `src/components/diagnostic/CatalogScreen.tsx`**

1. Criar função `getUnitPrice(product, quantity)` com a tabela de faixas acima
2. Substituir todos os usos de `(price_min + price_max) / 2` por `getUnitPrice(product, qty)`
3. No card do produto:
   - Mostrar o preço unitário atual baseado na quantidade selecionada
   - Adicionar indicador visual tipo "↓ preço reduz com mais unidades" quando `price_min < price_max`
4. No `totalEstimate`, usar `getUnitPrice` para cada produto
5. No `handleConfirm`, passar o `avgPrice` correto baseado na quantidade

### Visual no card (quando selecionado)

```text
[Produto X]
R$ 195,00 /un  ← preço atual para 10 un
"Quanto mais, menor o preço"

[10] [50] [100] [500]   ← chips de quantidade
[-] 10 [+]              ← ajuste fino
Subtotal aprox.: R$ 1.950,00
```

Quando o usuário muda a quantidade para 100, o preço atualiza automaticamente para refletir a faixa menor.

