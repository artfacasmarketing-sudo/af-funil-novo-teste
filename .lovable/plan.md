

## Plano: Adicionar categoria "Kit Facas" e garantir Kit Artfacas no fallback

### 1. `src/data/questions.ts` (Questão 8)
- Inserir `{ id: 'kit-facas', label: 'Kit Facas' }` como terceira opção (após "Mais Vendidos", antes de "Garrafas / Squeezes").

### 2. `src/data/products.ts` (categoryMapping)
- Adicionar `'kit-facas': ['kit-facas']` no mapeamento.

### 3. `src/lib/adminApi.ts` (CATEGORY_OPTIONS)
- Inserir `{ id: "kit-facas", label: "Kit Facas" }` como terceira opção no array, para tagear produtos no admin.

### 4. Produto "Kit Artfacas 7pcs" no fallback estático
- Adicionar o produto Kit Artfacas 7pcs na lista estática `products` em `src/data/products.ts`, para que o pinning funcione mesmo quando o DB não retorna dados. Vou buscar os dados completos do banco para criar a entrada correta.

Nenhuma alteração de banco necessária.

