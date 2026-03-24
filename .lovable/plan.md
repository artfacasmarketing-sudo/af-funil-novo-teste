

## Plan: Add Export Button to Admin Product List

Add an "Exportar para E-commerce" button in `src/components/admin/ProductList.tsx` that exports all products as a JSON file.

### Changes (single file)

**`src/components/admin/ProductList.tsx`**

1. Import `Download` from `lucide-react`
2. Add `handleExport` function that maps products to e-commerce format and triggers JSON download
3. Add the button in the toolbar next to "Novo", conditionally rendered when `products.length > 0`

All logic exactly as specified in the request — slug generation, category mapping, color variants, pricing tiers, blob download, and toast confirmation.

