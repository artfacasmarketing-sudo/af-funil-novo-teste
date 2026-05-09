## Acesso rápido às landing pages

### Objetivo
Facilitar o acesso às landing pages de produto (ex.: `/p/chapeu-bambu`) dentro do preview do Lovable e em produção, sem precisar digitar a URL manualmente.

### O que será feito

**1. Nova página índice `/landings`**
- Lista todas as landing pages cadastradas em `src/data/landingProducts.ts` (atualmente: Chapéu Fibra de Bambu).
- Cada item exibe: imagem principal, nome do produto, tagline, preço a partir de e botão "Abrir landing" → `/p/:slug`.
- Layout em grid responsivo, usando tokens semânticos do design system (fundo preto, AF Blue como destaque).
- Header global (`LogoHeader`) e footer minimalista, no mesmo padrão da `ProductLanding`.
- SEO: `document.title` "Landing pages — AF Brindes" e meta description.
- Adicionar rota em `src/App.tsx`: `<Route path="/landings" element={<LandingsIndex />} />` antes do catch-all.
- À medida que novos produtos forem adicionados ao `landingProducts.ts`, eles aparecem automaticamente no índice.

**2. Seção discreta no rodapé da home (`/`)**
- Adicionar um pequeno bloco no final da `IntroScreen` (ou logo acima do footer existente) com o título "Landing pages de produto" e chips/links para cada landing cadastrada + um link "Ver todas" para `/landings`.
- Estilo discreto (texto pequeno, cor `muted-foreground`), para não competir com o funil principal.
- Sempre visível (preview e produção), conforme escolhido.

### Arquivos alterados
- `src/pages/LandingsIndex.tsx` — nova página índice
- `src/App.tsx` — adicionar rota `/landings`
- `src/components/diagnostic/IntroScreen.tsx` — adicionar seção de links no rodapé

### Fora de escopo
- Criar landing pages de outros produtos (próxima iteração).
- Mudar comportamento ou conteúdo da landing existente.
