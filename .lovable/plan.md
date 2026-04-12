

## Plano: Adicionar upload de logo na tela de contato

### Alterações

**1. `src/components/diagnostic/ContactScreen.tsx`**
- Adicionar seção de upload de arquivos da marca (logo) no formulário, antes do botão de enviar
- Componente: input file com aceite de PNG, JPG, WebP, PDF (máx 5MB cada, até 10 arquivos)
- Preview dos arquivos selecionados com botão de remover
- Upload obrigatório: botão "Solicitar orçamento" desabilitado se nenhum arquivo anexado, com aviso visual
- No submit, chamar `uploadBrandFiles()` antes de enviar o lead
- Passar as URLs resultantes para `submitLeadSimplified()` (atualizar `file_urls` no payload)

**2. `src/lib/supabaseLeadService.ts`**
- Atualizar `submitLeadSimplified` para aceitar `fileUrls: string[]` como parâmetro
- Incluir `file_urls: fileUrls` no payload em vez de array vazio

**Visual no formulário:**
```text
[Nome *]
[WhatsApp *]
[E-mail]
[Empresa]

📎 Envie a logo da sua marca *
[Selecionar arquivos]  PNG, JPG, WebP ou PDF (máx 5MB)
  logo.png ✕
  marca.pdf ✕

[Solicitar orçamento]  ← desabilitado sem arquivos
```

### Resultado
O lead sempre chega com os arquivos da marca anexados, garantindo que o especialista tenha a logo para montar o orçamento.

