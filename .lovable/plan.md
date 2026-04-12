

## Plano: Adicionar busca e filtro por categorias no CatalogScreen

### Alteração em um único arquivo: `src/components/diagnostic/CatalogScreen.tsx`

**1. Barra de pesquisa**
- Campo de texto com ícone de lupa, abaixo do título e acima do grid
- Filtra produtos pelo nome em tempo real (case-insensitive, sem acentos)
- Placeholder: "Buscar produto..."

**2. Filtro por categorias**
- Linha de chips/botões horizontais com scroll, abaixo da busca
- Categorias extraídas dinamicamente dos produtos carregados (ex: Todos, Cadernos, Camping, Canivetes, Chapéus, Copos, Facas, Garrafas, Kits)
- "Todos" selecionado por padrão
- Labels formatados com capitalize e acentos corretos via mapa de labels
- Ao selecionar uma categoria, mostra apenas produtos daquela categoria
- Busca e categoria funcionam juntos (AND)

**3. Experiência**
- Barra de pesquisa e categorias ficam fixas/sticky abaixo do título para facilitar navegação
- Grid de produtos atualiza instantaneamente
- Se nenhum produto encontrado, mostra mensagem "Nenhum produto encontrado"
- Seleções de produtos (quantidades) se mantêm mesmo ao trocar filtro

