import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoHeader } from '@/components/diagnostic/LogoHeader';
import { getLandingProduct } from '@/data/landingProducts';

export default function ThankYou() {
  const [params] = useSearchParams();
  const slug = params.get('p') || '';
  const product = getLandingProduct(slug);

  useEffect(() => {
    document.title = 'Obrigado! Recebemos seu orçamento · AF Brindes';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="[&_div]:!mb-0">
            <LogoHeader size="sm" />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Pedido recebido!</h1>
          <p className="text-lg text-muted-foreground">
            {product
              ? `Seu interesse no ${product.name} foi registrado. Nossa equipe entrará em contato pelo WhatsApp em poucos minutos com a proposta personalizada.`
              : 'Recebemos seu pedido. Nossa equipe entrará em contato pelo WhatsApp em poucos minutos.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Enquanto isso, conheça mais soluções da AF Brindes Corporativos:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="h-12 px-8">
              <a href="https://artfacas.com" target="_blank" rel="noopener noreferrer">
                Visitar artfacas.com
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AF Brindes Corporativos
        </div>
      </footer>
    </div>
  );
}
