import { useEffect, useState } from 'react';
import { LogoHeader } from './LogoHeader';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const messages = [
  'Entendendo seu objetivo...',
  'Ajustando estratégia ao público e à escala...',
  'Considerando prazo e nível de personalização...',
  'Preparando a curadoria do especialista AF...',
];

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages(prev => {
        if (prev < messages.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-8 sm:pt-12">
      <LogoHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="text-center space-y-8 sm:space-y-10 animate-fade-in">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin-slow" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Analisando Estratégia...
        </h2>

        {/* Messages */}
        <div className="space-y-3 sm:space-y-4 processing-stagger">
          {messages.map((message, idx) => (
            <p
              key={idx}
              className={`
                text-muted-foreground text-sm sm:text-base transition-all duration-500
                ${idx < visibleMessages ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
            >
              {message}
            </p>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
