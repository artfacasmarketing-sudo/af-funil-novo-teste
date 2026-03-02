

## Plano: Fixar 3 produtos prioritários no topo da vitrine

### Mudança única em `src/data/products.ts` — função `getFilteredProducts`

Após filtrar os produtos por categorias, reordenar o resultado para que estes 3 produtos (identificados por SKU) apareçam sempre primeiro, nesta ordem:

1. **Colete Puffer** (`colete-puffer`)
2. **Kit Artfacas 7pcs** (`kit-artfacas-7pcs`)
3. **Kit Corporativo** (`kits-corporativos`)

Lógica:
- Buscar esses 3 produtos no array `source` completo (não apenas nos filtrados), para garantir que apareçam mesmo que o lead não tenha selecionado a categoria correspondente.
- Remover duplicatas do array filtrado.
- Retornar: `[...pinned encontrados, ...filtrados sem duplicatas]`.

Nenhuma outra alteração em nenhum outro arquivo.

