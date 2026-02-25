import { useEffect } from 'react';
import { Question, phaseNames } from '@/data/questions';
import { Progress } from '@/components/ui/progress';
import { QuestionRenderer } from './QuestionRenderer';
import { LogoHeader } from './LogoHeader';
import { ChevronLeft } from 'lucide-react';

interface FunnelScreenProps {
  questions: Question[];
  currentIndex: number;
  onAnswer: (questionId: number, value: string, files?: File[]) => void;
  onClickSFX: () => void;
  onBack?: () => void;
}

export function FunnelScreen({ questions, currentIndex, onAnswer, onClickSFX, onBack }: FunnelScreenProps) {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const canGoBack = currentIndex > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex]);

  const handleBack = () => {
    if (canGoBack && onBack) {
      onClickSFX();
      onBack();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
      <LogoHeader />
      
      {/* Botão voltar discreto */}
      {canGoBack && (
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 z-20 flex items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300 text-xs group"
          aria-label="Voltar para pergunta anterior"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Voltar</span>
        </button>
      )}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
          {/* Progress section */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="mono-font uppercase text-[10px] sm:text-xs text-muted-foreground">
                  Etapa {currentQuestion.phase} de 5
                </span>
                <span className="text-primary font-semibold text-sm sm:text-base">
                  {phaseNames[currentQuestion.phase]}
                </span>
              </div>
              <span className="mono-font text-[10px] sm:text-xs text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-1.5 sm:h-2 bg-muted"
            />
          </div>

          {/* Question */}
          <div className="space-y-2 sm:space-y-3 animate-fade-in-up" key={currentQuestion.id}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              {currentQuestion.title}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Question renderer */}
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={onAnswer}
            onClickSFX={onClickSFX}
          />

          {/* Footer signature */}
          <div className="flex items-center justify-center gap-2 pt-6 sm:pt-8 opacity-15">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-semibold">
              Curadoria Consultiva AF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}