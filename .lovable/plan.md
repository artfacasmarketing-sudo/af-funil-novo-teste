

## Plano: Corrigir tratamento de erros no funil

### Alterações

**1. `src/components/diagnostic/ContactScreen.tsx`** — 3 correções:

- **Linha ~114**: Após `uploadBrandFiles`, validar se `fileUrls` retornou vazio antes de prosseguir:
  ```typescript
  fileUrls = await uploadBrandFiles(files);
  if (!fileUrls || fileUrls.length === 0) {
    setErrorMessage('Falha no upload dos arquivos. Tente novamente.');
    setSubmitState('error');
    return;
  }
  ```

- **Linha ~144**: Já está correto (`result.error || 'Erro ao enviar...'`). Nenhuma alteração necessária.

- **Linhas 329-332**: Trocar o bloco de mensagem de arquivo obrigatório para sempre visível quando `files.length === 0`:
  ```typescript
  {files.length === 0 && (
    <p className={`text-xs ${fileError ? 'text-destructive' : 'text-muted-foreground'}`}>
      {fileError || 'Obrigatório — envie a logo da sua marca para prosseguir'}
    </p>
  )}
  ```

**2. `supabase/functions/submit-lead/index.ts`** — Linha ~148-154:

Retornar o primeiro erro de validação legível em vez de mensagem genérica:
```typescript
const firstError = validationResult.error.errors[0];
const errorMessage = firstError?.message || 'Dados inválidos. Verifique os campos.';
return new Response(
  JSON.stringify({ success: false, error: errorMessage }),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

Re-deploy da edge function após a alteração.

