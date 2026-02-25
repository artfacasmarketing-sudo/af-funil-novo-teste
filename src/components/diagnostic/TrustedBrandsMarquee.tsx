const brands = [
  'Empresa Alpha',
  'Tech Solutions',
  'Grupo Beta',
  'Innovation Co',
  'Global Industries',
  'Smart Corp',
  'Digital Plus',
  'Prime Group',
];

export function TrustedBrandsMarquee() {
  return (
    <section className="w-full py-8 sm:py-10">
      {/* Title */}
      <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
        Marcas que confiam na AF
      </p>

      {/* Marquee container with fade edges */}
      <div 
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        {/* Animated track - duplicated for seamless loop */}
        <div className="flex animate-marquee">
          {/* First set */}
          {brands.map((brand, index) => (
            <div
              key={`brand-1-${index}`}
              className="flex-shrink-0 mx-6 sm:mx-8 md:mx-10"
            >
              <div className="px-6 py-3 rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm opacity-50 hover:opacity-80 transition-opacity duration-300">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {brand}
                </span>
              </div>
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {brands.map((brand, index) => (
            <div
              key={`brand-2-${index}`}
              className="flex-shrink-0 mx-6 sm:mx-8 md:mx-10"
            >
              <div className="px-6 py-3 rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm opacity-50 hover:opacity-80 transition-opacity duration-300">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {brand}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
