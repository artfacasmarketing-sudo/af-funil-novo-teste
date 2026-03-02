

## Problema

A edge function `submit-lead` (linhas 204-230) gera **signed URLs** com expiração de 7 dias para enviar ao webhook/CRM. Como o bucket `brand-files` agora é **público**, basta enviar as URLs públicas permanentes — sem necessidade de `createSignedUrl`.

## Plano

### Arquivo: `supabase/functions/submit-lead/index.ts`

**Remover** todo o bloco de geração de signed URLs (linhas ~202-220) e substituir por uma simples construção de URLs públicas permanentes:

```typescript
// Antes: createSignedUrl com expiração de 7 dias
// Depois: URLs públicas permanentes usando o SUPABASE_URL

let publicFileUrls: string[] = payload.file_urls || [];
if (publicFileUrls.length > 0) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  publicFileUrls = publicFileUrls.map((url: string) => {
    const pathMatch = url.match(/brand-files\/(.+)$/);
    if (pathMatch?.[1]) {
      return `${supabaseUrl}/storage/v1/object/public/brand-files/${pathMatch[1]}`;
    }
    return url;
  });
}
```

No webhook payload (linha ~235), usar `publicFileUrls` em vez de `signedFileUrls`:

```typescript
file_urls: publicFileUrls,
```

Remover a variável `signedFileUrls` e todo o `Promise.all` com `createSignedUrl`.

**Resultado**: URLs permanentes no CRM, sem expiração.

