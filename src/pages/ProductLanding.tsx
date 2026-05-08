import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowDown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoHeader } from '@/components/diagnostic/LogoHeader';
import { ProductCarousel } from '@/components/landing/ProductCarousel';
import { LandingForm } from '@/components/landing/LandingForm';
import { getLandingProduct } from '@/data/landingProducts';

function setMeta(title: string, description: string) {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', description);

  // canonical
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', window.location.href.split('?')[0]);
}

export default function ProductLanding() {
  const { slug = '' } = useParams<{ slug: string }>();
  const product = getLandingProduct(slug);

  useEffect(() => {
    if (product) setMeta(product.metaTitle, product.metaDescription);
  }, [product]);

  if (!product) return <Navigate to="/404" replace />;

  const scrollToForm = () => {
    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'AF Brindes Corporativos' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.unitPriceFrom.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="[&_div]:!mb-0">
            <LogoHeader size="sm" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-8 sm:pt-12 pb-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Brinde corporativo premium
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {product.tagline}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{product.headline}</p>

            <ul className="space-y-2.5">
              {product.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" onClick={scrollToForm} className="h-12 px-8 text-base font-semibold">
                Quero esse brinde <ArrowDown className="h-4 w-4" />
              </Button>
              <div className="flex flex-col justify-center text-sm text-muted-foreground">
                <span>
                  A partir de <strong className="text-foreground">R$ {product.unitPriceFrom.toFixed(2).replace('.', ',')}/un</strong>
                </span>
                <span>Pedido mínimo: {product.minQty} unidades</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <ProductCarousel images={product.images} />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-14 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Sobre o produto</h2>
            <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Técnicas disponíveis: gravação a laser, silk screen, sublimação e bordado. Layout e arte
              são desenvolvidos gratuitamente pela nossa equipe, com prazo médio de 15 dias úteis.
            </p>
          </div>
          <aside className="rounded-2xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Características
            </h3>
            <dl className="space-y-3">
              {product.specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="font-medium text-right">{s.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* Form */}
      <section id="form" className="container mx-auto px-4 py-16 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {product.tagline}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Receba seu orçamento personalizado
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados abaixo e nossa equipe entra em contato em poucos minutos.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <LandingForm product={product} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AF Brindes Corporativos · Brindes que transformam.
        </div>
      </footer>
    </div>
  );
}
