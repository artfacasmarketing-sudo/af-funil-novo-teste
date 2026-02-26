

## Plano: Trocar skeletons por loader com copy na vitrine de produtos

### Mudança

**Arquivo:** `src/components/diagnostic/ProductSelectionScreen.tsx`

Substituir os skeleton cards por um loader centralizado com spinner + texto motivacional, similar ao `ProcessingScreen.tsx` mas mais curto e simples.

### Implementação

No bloco `{isLoading ? (...) : (...)}` (linhas 171-184), trocar os skeletons por:

```tsx
<div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in">
  <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin-slow mb-6" />
  <p className="text-muted-foreground text-sm sm:text-base font-medium">
    Encontrando as melhores opções para você...
  </p>
</div>
```

- Remove import do `Skeleton` (não será mais usado)
- Reutiliza a animação `animate-spin-slow` já existente no projeto (usada no `ProcessingScreen`)
- Loader minimalista, centralizado, sem skeletons

