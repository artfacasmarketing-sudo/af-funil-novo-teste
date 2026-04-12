

## Plano: Chips de quantidade pré-definida + ajuste fino + label "preço aproximado"

### Alteração: `src/components/diagnostic/CatalogScreen.tsx`

**1. Adicionar chips de quantidade pré-definida**
- Dentro do card do produto selecionado, acima dos botões +/-, adicionar uma linha de 4 chips: `10`, `50`, `100`, `500`
- Clicar num chip define a quantidade para aquele valor
- Chip ativo (quantidade atual = valor do chip) fica destacado com `bg-primary`
- Quantidade padrão ao selecionar produto pela primeira vez: **10** (em vez de 1)

**2. Manter botões +/- para ajuste fino**
- Continuam funcionando exatamente como hoje (±1, mínimo 1)
- Ficam abaixo dos chips

**3. Labels de "preço aproximado"**
- No card do produto: trocar `"/ un"` por `"aprox. / un"` 
- No subtotal do card: trocar `"Subtotal:"` por `"Subtotal aprox.:"` 
- Na barra inferior: trocar `"Orçamento estimado"` por `"Orçamento aproximado"` e adicionar uma linha pequena: `"* Valores aproximados, sujeitos a confirmação"`

**Layout visual do seletor (dentro do card):**
```text
[ 10 ] [ 50 ] [ 100 ] [ 500 ]
    [ - ]    42    [ + ]
   Subtotal aprox.: R$ X.XXX,XX
```

### Resultado
O cliente tem atalhos rápidos para quantidades comuns, pode ajustar por unidade, e fica claro que os preços são aproximados.

