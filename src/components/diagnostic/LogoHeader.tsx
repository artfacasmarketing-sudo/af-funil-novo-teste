import logoAf from '@/assets/logo-af.png';

interface LogoHeaderProps {
  size?: 'sm' | 'md';
}

export function LogoHeader({ size = 'sm' }: LogoHeaderProps) {
  const sizeClasses = size === 'sm' 
    ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
    : 'w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px]';
    
  return (
    <div className="flex justify-center mb-6">
      <img 
        src={logoAf} 
        alt="AF Brindes" 
        className={`${sizeClasses} object-contain`}
      />
    </div>
  );
}
