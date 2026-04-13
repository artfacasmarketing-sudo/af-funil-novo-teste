

## Plano: Adicionar coleta de CPF/CNPJ e Inscrição Estadual

### O que será feito

Adicionar campos de documento (CPF ou CNPJ) e inscrição estadual no formulário de contato, e enviar esses dados no payload para a edge function — exatamente como já está modelado no banco e na função `submit-lead`.

### Alterações

**1. `src/components/diagnostic/ContactScreen.tsx`**

- Adicionar estados: `documentType` (toggle CPF/CNPJ), `documentNumber`, `stateRegistration`
- Adicionar no formulário (após "Nome da empresa"):
  - Toggle CPF / CNPJ (dois botões lado a lado)
  - Input de número do documento com máscara visual
  - Se CNPJ selecionado: campo adicional "Inscrição Estadual (opcional)"
- Passar os novos campos no `submitLeadSimplified`

**2. `src/lib/supabaseLeadService.ts`**

- Expandir a interface do `submitLeadSimplified` para aceitar `documentType`, `documentNumber`, `stateRegistration`
- Incluir esses campos no payload enviado à edge function (já existem as chaves `document_type`, `document_number`, `state_registration` no payload — basta preenchê-las)

### Detalhes técnicos

- A edge function `submit-lead` já valida e aceita `document_type`, `document_number` e `state_registration` — nenhuma alteração no backend é necessária
- A tabela `leads` já tem as colunas `document_type`, `document_number` e `state_registration` — nenhuma migração necessária
- Os campos de documento são opcionais (não bloqueiam o envio)

