import { useState, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { questions } from '@/data/questions';
import { calculateResults, DiagnosticResults } from '@/lib/resultsCalculator';
import { IntroScreen } from './IntroScreen';
import { FunnelScreen } from './FunnelScreen';
import { ProductSelectionScreen, SelectedProduct } from './ProductSelectionScreen';
import { ProcessingScreen } from './ProcessingScreen';
import { ResultsScreen } from './ResultsScreen';
import { CaptureScreen } from './CaptureScreen';

type Step = 'intro' | 'funnel' | 'products' | 'processing' | 'results' | 'capture';

export function DiagnosticApp() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [selectedPath, setSelectedPath] = useState('');
  const [brandFiles, setBrandFiles] = useState<File[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const { startBGM, fadeOutBGM, playClickSFX, playTransitionSFX, playCompletionSFX, playCelebrationSFX } = useAudio();

  const handleStart = useCallback(() => {
    startBGM();
    setStep('funnel');
  }, [startBGM]);

  const handleAnswer = useCallback((questionId: number, value: string, files?: File[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));

    // Store brand files if provided (from file-upload question)
    if (files && files.length > 0) {
      setBrandFiles(files);
    }

    // Move to next question or products step
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      playTransitionSFX();
      setCurrentQuestionIndex(nextIndex);
    } else {
      // After last question, go to product selection
      setStep('products');
    }
  }, [currentQuestionIndex, playTransitionSFX]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      playTransitionSFX();
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex, playTransitionSFX]);

  const handleProductsConfirm = useCallback((products: SelectedProduct[]) => {
    playTransitionSFX();
    setSelectedProducts(products);
    setStep('processing');
  }, [playTransitionSFX]);

  const handleProcessingComplete = useCallback(() => {
    playCompletionSFX();
    const calculatedResults = calculateResults(responses);
    setResults(calculatedResults);
    setStep('results');
  }, [responses, playCompletionSFX]);

  const handlePathSelected = useCallback((pathTitle: string) => {
    playClickSFX();
    setSelectedPath(pathTitle);
    setStep('capture');
  }, [playClickSFX]);

  const handleExtraChange = useCallback((value: string) => {
    setResponses(prev => ({
      ...prev,
      extra: value,
    }));
  }, []);

  const handleCelebrate = useCallback(() => {
    playCelebrationSFX();
    fadeOutBGM(8);
  }, [playCelebrationSFX, fadeOutBGM]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Content */}
      <div className="relative z-10">
        {step === 'intro' && (
          <IntroScreen onStart={handleStart} />
        )}

        {step === 'funnel' && (
          <FunnelScreen
            questions={questions}
            currentIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onClickSFX={playClickSFX}
            onBack={handleBack}
          />
        )}

        {step === 'products' && (
          <ProductSelectionScreen
            responses={responses}
            onConfirm={handleProductsConfirm}
            onClickSFX={playClickSFX}
          />
        )}

        {step === 'processing' && (
          <ProcessingScreen onComplete={handleProcessingComplete} />
        )}

        {step === 'results' && results && (
          <ResultsScreen
            results={results}
            onPathSelected={handlePathSelected}
          />
        )}

        {step === 'capture' && results && (
          <CaptureScreen
            selectedPath={selectedPath}
            results={results}
            responses={responses}
            brandFiles={brandFiles}
            selectedProducts={selectedProducts}
            onExtraChange={handleExtraChange}
            onCelebrate={handleCelebrate}
          />
        )}
      </div>
    </div>
  );
}
