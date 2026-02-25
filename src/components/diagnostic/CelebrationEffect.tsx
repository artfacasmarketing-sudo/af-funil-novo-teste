import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'star' | 'circle' | 'diamond';
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(45, 100%, 60%)',  // Gold
  'hsl(45, 100%, 70%)',  // Light gold
  'hsl(30, 100%, 65%)',  // Amber
  'hsl(0, 0%, 100%)',    // White sparkle
];

export function CelebrationEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create initial burst of particles
    const createParticles = () => {
      const newParticles: Particle[] = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.5;
        const velocity = 8 + Math.random() * 12;
        const types: ('star' | 'circle' | 'diamond')[] = ['star', 'circle', 'diamond'];
        
        newParticles.push({
          id: i,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 5,
          size: 6 + Math.random() * 10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: 1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }

      // Add delayed secondary burst
      setTimeout(() => {
        const secondBurst: Particle[] = [];
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 5 + Math.random() * 8;
          const types: ('star' | 'circle' | 'diamond')[] = ['star', 'circle', 'diamond'];
          
          secondBurst.push({
            id: 100 + i,
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 200,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 3,
            size: 4 + Math.random() * 8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            opacity: 1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            type: types[Math.floor(Math.random() * types.length)],
          });
        }
        setParticles(prev => [...prev, ...secondBurst]);
      }, 200);

      return newParticles;
    };

    setParticles(createParticles());

    // Animation loop
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to ~60fps
      lastTime = currentTime;

      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * deltaTime,
            y: p.y + p.vy * deltaTime,
            vy: p.vy + 0.3 * deltaTime, // Gravity
            vx: p.vx * 0.99, // Air resistance
            opacity: p.opacity - 0.008 * deltaTime,
            rotation: p.rotation + p.rotationSpeed * deltaTime,
          }))
          .filter(p => p.opacity > 0 && p.y < window.innerHeight + 100);

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderParticle = (particle: Particle) => {
    const style = {
      left: particle.x,
      top: particle.y,
      opacity: particle.opacity,
      transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
      width: particle.size,
      height: particle.size,
    };

    switch (particle.type) {
      case 'star':
        return (
          <svg
            key={particle.id}
            className="absolute pointer-events-none"
            style={{ ...style, width: particle.size * 1.5, height: particle.size * 1.5 }}
            viewBox="0 0 24 24"
            fill={particle.color}
          >
            <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
          </svg>
        );
      case 'diamond':
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              ...style,
              backgroundColor: particle.color,
              transform: `translate(-50%, -50%) rotate(${particle.rotation + 45}deg)`,
            }}
          />
        );
      default:
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              ...style,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {particles.map(renderParticle)}
      
      {/* Central glow burst */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-celebration-glow"
        style={{
          background: 'radial-gradient(circle, hsla(var(--primary), 0.4) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
