import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LogoHeader } from '@/components/diagnostic/LogoHeader';
import { Button } from '@/components/ui/button';
import { landingProducts } from '@/data/landingProducts';

export default function LandingsIndex() {
  useEffect(() => {
    document.title = 'Landing pages — AF Brindes';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'Índice de landing pages de produtos AF Brindes — acesse rapidamente cada brinde corporativo personalizado.',
    );
  }, []);

  const items = Object.values(landingProducts);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="[&_div]:!mb-0">
            <LogoHeader size="sm" />
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            O brinde transforma
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Landing pages de produto
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Acesse rapidamente cada landing individual de produto.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhuma landing page cadastrada ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {items.map((p) => (
              <Link
                key={p.slug}
                to={`/p/${p.slug}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/60 transition-all glow-hover"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={p.images[0]?.url}
                    alt={p.images[0]?.alt ?? p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    {p.tagline}
                  </p>
                  <h2 className="text-xl font-bold leading-tight">{p.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.headline}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      A partir de{' '}
                      <strong className="text-foreground">
                        R$ {p.unitPriceFrom.toFixed(2).replace('.', ',')}/un
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <code className="block text-[10px] text-muted-foreground/70 mono-font pt-1">
                    /p/{p.slug}
                  </code>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link to="/">Voltar à home</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AF Brindes Corporativos
        </div>
      </footer>
    </div>
  );
}
