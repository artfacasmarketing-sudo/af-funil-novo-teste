

## Plano: Melhorar compatibilidade do link WhatsApp

### Diagnostico
- O link `https://wa.me/5562999993577` esta **correto e funcionando** (testei e confirma o numero +55 62 99999-3577)
- O "link quebrado" provavelmente ocorre no **preview do Lovable** (iframe bloqueia `target="_blank"`)
- No site publicado (`diaganostico-premium-artfacas.lovable.app`) deve funcionar normalmente

### Correção proposta
Trocar o formato do link de `wa.me` para `api.whatsapp.com/send` que tem melhor compatibilidade em diferentes dispositivos e contextos:

**Arquivo:** `src/components/diagnostic/CaptureScreen.tsx` (linha 240)

- **De:** `href="https://wa.me/5562999993577"`
- **Para:** `href="https://api.whatsapp.com/send?phone=5562999993577"`

### Detalhes tecnicos
- O formato `api.whatsapp.com/send` e o link oficial da API do WhatsApp Business
- Funciona melhor em navegadores mobile, desktop e dentro de webviews/iframes
- Aceita parametro `text=` para mensagem pre-definida (pode adicionar depois se quiser)
- Nenhum outro arquivo precisa ser alterado

