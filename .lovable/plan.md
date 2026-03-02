

## Plano: Adicionar quantidade e nota "preço por unidade" no card de produto

### Mudança única em `src/components/diagnostic/ProductSelectionScreen.tsx` — bloco de info do `ProductCard` (linhas 271-281)

Adicionar duas informações discretas sem alterar o layout existente:

1. **Acima do preço**: linha com `Qtd: 10 – 1.000+`
2. **Abaixo do preço**: linha com `preço por unidade`

Ajustar altura do container de `h-[6.5rem]` para `h-[8rem]` para acomodar as duas linhas extras.

Resultado:
```
Nome do Produto
Qtd: 10 – 1.000+        ← novo, text-[9px] muted
R$ 100,00 – R$ 200,00
preço por unidade        ← novo, text-[9px] muted
SKU: xxx
```

Ambas as linhas usam `text-[9px] text-muted-foreground mono-font` para manter discrição.

