import { useState, useEffect, useRef } from 'react';
import { Check, Upload, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Question, colorOptions } from '@/data/questions';
import { toast } from 'sonner';

interface QuestionRendererProps {
  question: Question;
  onAnswer: (questionId: number, value: string, files?: File[]) => void;
  onClickSFX: () => void;
}

interface FileWithPreview {
  file: File;
  preview?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];

export function QuestionRenderer({ question, onAnswer, onClickSFX }: QuestionRendererProps) {
  const [multiChoices, setMultiChoices] = useState<string[]>([]);
  const [colorChoices, setColorChoices] = useState<string[]>([]);
  const [brandFlag, setBrandFlag] = useState(false);
  const [customHex, setCustomHex] = useState('');
  const [textValue, setTextValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when question changes
  useEffect(() => {
    setMultiChoices([]);
    setColorChoices([]);
    setBrandFlag(false);
    setCustomHex('');
    setTextValue('');
    setUploadedFiles([]);
  }, [question.id]);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, [uploadedFiles]);

  // Focus input for text questions
  useEffect(() => {
    if (question.type === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.type, question.id]);

  const handleOptionClick = (optionId: string) => {
    onClickSFX();
    onAnswer(question.id, optionId);
  };

  const handleMultiToggle = (optionId: string) => {
    onClickSFX();
    
    if (optionId === 'sugestao') {
      setMultiChoices(['sugestao']);
    } else {
      setMultiChoices(prev => {
        const filtered = prev.filter(id => id !== 'sugestao');
        if (filtered.includes(optionId)) {
          return filtered.filter(id => id !== optionId);
        }
        return [...filtered, optionId];
      });
    }
  };

  const handleMultiConfirm = () => {
    if (multiChoices.length === 0) return;
    onClickSFX();
    onAnswer(question.id, multiChoices.join(','));
  };

  const handleTextSubmit = () => {
    onClickSFX();
    onAnswer(question.id, textValue || 'Não informado');
  };

  const handleColorToggle = (colorId: string) => {
    onClickSFX();
    setBrandFlag(false);
    setColorChoices(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  const handleBrandFlagToggle = () => {
    onClickSFX();
    setBrandFlag(!brandFlag);
    if (!brandFlag) {
      setColorChoices([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FileWithPreview[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check max files
      if (uploadedFiles.length + newFiles.length >= MAX_FILES) {
        toast.error(`Máximo de ${MAX_FILES} arquivos permitidos`);
        break;
      }

      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Tipo não suportado: ${file.name}`);
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Arquivo muito grande: ${file.name} (máx 5MB)`);
        continue;
      }

      // Create preview for images
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined;

      newFiles.push({ file, preview });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const convertFilesToBase64 = async (): Promise<Array<{ filename: string; base64: string; type: string; size: number }>> => {
    const results = await Promise.all(
      uploadedFiles.map(({ file }) => {
        return new Promise<{ filename: string; base64: string; type: string; size: number }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1] || '';
            resolve({
              filename: file.name,
              base64,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    return results;
  };

  const handleColorConfirm = () => {
    onClickSFX();
    
    const colorData = JSON.stringify({
      cor_preferida_lista: colorChoices,
      cor_marca_flag: brandFlag,
      cor_codigos: customHex,
    });
    
    onAnswer(question.id, colorData);
  };

  const handleFileUploadConfirm = () => {
    onClickSFX();
    const files = uploadedFiles.map(f => f.file);
    onAnswer(question.id, '', files);
  };

  // Text input view
  if (question.type === 'text') {
    return (
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <Input
          ref={inputRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          placeholder={question.placeholder}
          className="bg-secondary border-border py-6 sm:py-7 text-base"
        />

        <Button
          onClick={handleTextSubmit}
          className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
        >
          Continuar
        </Button>
      </div>
    );
  }

  // Color picker view
  if (question.type === 'color-picker') {
    return (
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        {/* Color picker grid */}
        <div className="space-y-3">
          <label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            🎨 Cores da campanha
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 sm:gap-4 py-2">
            {colorOptions.map(color => (
              <button
                key={color.id}
                onClick={() => handleColorToggle(color.id)}
                className="group flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-200"
              >
                <div
                  className={`
                    w-12 h-12 sm:w-11 sm:h-11 rounded-full transition-all duration-200
                    ${color.id === 'black' ? 'border border-zinc-600' : ''}
                    ${colorChoices.includes(color.id)
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <Checkbox
            id="brand-flag"
            checked={brandFlag}
            onCheckedChange={handleBrandFlagToggle}
            className="mt-0.5"
          />
          <label htmlFor="brand-flag" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
            Quero usar as cores da minha marca (enviar depois)
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            Possui códigos específicos? (HEX / Pantone)
          </label>
          <Input
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#1A2B3C / Pantone 300C..."
            className="bg-secondary border-border py-6"
          />
        </div>

        <Button
          onClick={handleColorConfirm}
          className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
        >
          Continuar
        </Button>
      </div>
    );
  }

  // File upload view
  if (question.type === 'file-upload') {
    return (
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <div className="space-y-3">
          <label className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            📎 Arquivos da marca (logo, manual, etc)
          </label>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Arquivos anexados ({uploadedFiles.length}/{MAX_FILES}):
              </p>
              {uploadedFiles.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.file.type === 'application/pdf' ? (
                      <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                    ) : (
                      <Image className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{item.file.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(item.file.size / 1024).toFixed(0)}KB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 hover:bg-destructive/20 rounded transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 sm:p-5 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-center"
          >
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Clique para anexar arquivos
            </span>
            <p className="text-xs text-muted-foreground/70 mt-1">
              PNG, JPG, SVG, PDF (máx 5MB cada)
            </p>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.svg,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleFileUploadConfirm}
          className="w-full rounded-2xl py-6 sm:py-7 font-semibold text-base glow-hover"
        >
          Confirmar Diagnóstico
        </Button>
      </div>
    );
  }

  // Multi-select view
  if (question.type === 'multi') {
    return (
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {question.options?.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => handleMultiToggle(option.id)}
              className={`
                min-h-[60px] p-4 sm:p-5 rounded-xl border text-left transition-all duration-200 glow-hover
                ${multiChoices.includes(option.id)
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-sm sm:text-base">{option.label}</span>
                {multiChoices.includes(option.id) && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <Button
          onClick={handleMultiConfirm}
          disabled={multiChoices.length === 0}
          className={`
            w-full rounded-2xl py-6 sm:py-7 font-semibold text-base transition-all
            ${multiChoices.length === 0 ? 'opacity-50 cursor-not-allowed' : 'glow-hover'}
          `}
        >
          Confirmar Seleção
        </Button>
      </div>
    );
  }

  // Primary options view (tiles/single)
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      <div className={`grid gap-3 sm:gap-4 ${question.type === 'tiles' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {question.options?.map((option, idx) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className="min-h-[60px] p-4 sm:p-5 rounded-xl border border-border bg-card hover:border-primary/50 text-left transition-all duration-200 glow-hover opacity-0 animate-fade-in"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <span className="font-medium text-sm sm:text-base">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
