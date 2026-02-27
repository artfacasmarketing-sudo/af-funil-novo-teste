

## Plano: Adicionar categoria "Mais Vendidos"

### Mudanças

**1. `src/data/questions.ts`** (Questão 8)
- Inserir `{ id: 'mais-vendidos', label: 'Mais Vendidos' }` como segunda opção (após "Kits / Kits Corporativos"), sem mexer nas demais.

**2. `src/data/products.ts`** (categoryMapping)
- Adicionar `'mais-vendidos': ['mais-vendidos']` no mapeamento de categorias.

**3. `src/lib/adminApi.ts`** (CATEGORY_OPTIONS)
- Inserir `{ id: "mais-vendidos", label: "Mais Vendidos" }` como segunda opção no array, para que apareça no admin e seja possível tagear produtos como "mais vendidos".

Nenhuma alteração de banco necessária — a coluna `categories` já é um array de texto livre, então basta adicionar `"mais-vendidos"` aos produtos desejados via o painel admin.

