

## Plano: Tornar documento obrigatório (CPF ou CNPJ)

### Mudanças em `src/components/diagnostic/CaptureScreen.tsx`

1. **Mostrar input de documento para ambos os tipos** — Atualmente o campo de número só aparece quando `documentType === 'cnpj'`. Mudar para sempre exibir o input, com placeholder dinâmico ("CPF *" ou "CNPJ *").

2. **Validação no submit** — A validação na linha 114 hoje só verifica documento quando é CNPJ. Mudar para sempre exigir `documentNumber` preenchido, independente do tipo selecionado.

3. **Manter tudo mais igual** — Inscrição Estadual continua aparecendo apenas para CNPJ. Nenhuma outra alteração.

### Detalhes técnicos

- Linha 114: trocar `if (documentType === 'cnpj' && !documentNumber.trim())` para `if (!documentNumber.trim())` com mensagem genérica "Por favor, preencha seu CPF ou CNPJ."
- Linha 377: remover a condição `documentType === 'cnpj'` do bloco do Input de documento, para que ele sempre apareça. Placeholder muda entre `"CPF *"` e `"CNPJ *"` conforme `documentType`.
- Linha 354: ao trocar para CPF, não limpar mais o `documentNumber` (remover `setDocumentNumber('')` do onClick do botão CPF).

