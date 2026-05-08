## Plano: Landing pages individuais por produto

### Visão geral
Criar landing pages de produto único acessíveis em URLs como `/p/chapeu-bambu`. Cada página tem header com logo, carrossel de fotos, frase "O brinde transforma", descrição, CTA que rola para o formulário, formulário de captura e redirect para `/obrigado`. Começar com Chapéu Fibra de Bambu como template.

### URL e roteamento
- Padrão: `/p/:slug` (ex.: `/p/chapeu-bambu`)
- Página de obrigado interna: `/obrigado`
- Adicionar rotas em `src/App.tsx` antes do catch-all

### Estrutura da página (top → bottom)
1. **Header** — `LogoHeader` existente, fundo limpo
2. **Carrossel clean avançado** — slides com fotos do produto (auto-play suave, dots discretos, transição fade/slide). Usar `embla-carousel-react` (já presente via shadcn `carousel`)
3. **Frase de impacto** — "O brinde transforma" como tagline grande
4. **Título do produto** — h1 com nome
5. **Descrição** — copy curta + bullets (material, mín. qtd, prazo, personalização)
6. **CTA principal** — botão "Quero esse brinde" com smooth-scroll para `#form`
7. **Formulário** — card centralizado, ancorado em `#form`
8. **Footer minimalista**

### Formulário (campos)
- Nome (obrigatório)
- WhatsApp (obrigatório, validação 10–15 dígitos com máscara)
- E-mail (obrigatório, validação)
- Empresa (obrigatório)
- Quantidade desejada (obrigatório, número)
- Tipo de documento: CPF ou CNPJ (radio)
- Número do documento (obrigatório, máscara + validação 11/14 dígitos)
- Inscrição Estadual (opcional, aparece se CNPJ)

Validação client-side com `zod` + mensagens claras de erro.

### Conteúdo do produto (Chapéu Fibra de Bambu)
- **Slug:** `chapeu-bambu`
- **Frase:** "O brinde transforma"
- **Descrição:** Texto adaptado de artfacas.com (estilo, conforto, versatilidade, ideal para eventos ao ar livre, personalização valoriza a marca)
- **Imagens:** buscar todas as fotos disponíveis (artfacas.com tem 14) — usar pelo menos 5–6 no carrossel
- **Specs:** Material Premium · Mín. 10 un · Prazo 15 dias úteis · Personalização colorida
- **Preço de referência:** a partir de R$ 49,37/un (apenas como gancho, sem mostrar como tabela)

### Submissão e tracking
- Reusar `submit-lead` Edge Function (já aceita `selected_products` com qty/preço, documento, etc.)
- Payload: produto único com sku/qty/unit_price + dados do formulário + UTMs
- Após sucesso: `trackLead` (Pixel + CAPI) → redirect para `/obrigado`
- **Eventos:** `PageView` (auto), `Lead` no submit
- Página `/obrigado`: mensagem de sucesso, CTA "Voltar ao site Artfacas" linkando https://artfacas.com

### Arquitetura de arquivos
```text
src/
  pages/
    ProductLanding.tsx         (página genérica, lê :slug e renderiza)
    ThankYou.tsx               (página /obrigado)
  components/
    landing/
      LandingHero.tsx          (carrossel + tagline + título)
      LandingDescription.tsx   (copy + specs)
      LandingForm.tsx          (formulário + submissão)
      LandingFooter.tsx
  data/
    landingProducts.ts         (config por slug: nome, descrição, imagens[], specs, sku)
```

### Configuração inicial em `landingProducts.ts`
Apenas o Chapéu Bambu nesta entrega. Estrutura preparada para adicionar novos produtos depois apenas inserindo um objeto no map (sem precisar criar componentes novos).

### Detalhes técnicos
- `react-router-dom` já configurado — adicionar duas rotas em `App.tsx`
- Carrossel: `@/components/ui/carousel` (Embla) com `opts={{ loop: true }}` + `Autoplay` plugin (verificar se está instalado; senão `bun add embla-carousel-autoplay`)
- Smooth scroll: `document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })`
- Reusar `useMetaPixel` para PageView e `trackLead`
- Reusar `MetaCookieContext` (já está no `App.tsx`)
- SEO por página: setar `document.title` e meta description via `useEffect` (h1 único, alt em todas as imagens do carrossel)
- Design: tokens semânticos do `index.css`, sem cores hardcoded

### Fora de escopo desta entrega
- Geração das landing pages dos demais produtos (será feita em iterações futuras reusando a mesma config)
- Edição dos componentes do funil principal (`DiagnosticApp`, `CatalogScreen`, `ContactScreen`)
