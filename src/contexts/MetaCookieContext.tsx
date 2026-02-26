import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MetaCookieContextType {
  fbp: string | undefined;
  fbc: string | undefined;
}

const MetaCookieContext = createContext<MetaCookieContextType>({
  fbp: undefined,
  fbc: undefined,
});

export function MetaCookieProvider({ children }: { children: ReactNode }) {
  const [fbp, setFbp] = useState<string>();
  const [fbc, setFbc] = useState<string>();

  useEffect(() => {
    // Function to capture cookies (preserving case sensitivity)
    const captureCookies = () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, ...valueParts] = cookie.trim().split('=');
        if (key) {
          // DO NOT convert to lowercase - preserve original value
          // _fbc is case-sensitive!
          acc[key] = valueParts.join('=');
        }
        return acc;
      }, {} as Record<string, string>);

      if (cookies['_fbp'] && !fbp) {
        setFbp(cookies['_fbp']);
        if (import.meta.env.DEV) console.log('[MetaCookie] Captured _fbp:', cookies['_fbp']);
      }
      if (cookies['_fbc'] && !fbc) {
        // IMPORTANT: _fbc is case-sensitive - do not modify
        setFbc(cookies['_fbc']);
        if (import.meta.env.DEV) console.log('[MetaCookie] Captured _fbc:', cookies['_fbc']);
      }
    };

    // Capture immediately on mount
    captureCookies();

    // Re-check every 500ms for 10 seconds (cookies may take time to be set)
    const interval = setInterval(captureCookies, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fbp, fbc]);

  return (
    <MetaCookieContext.Provider value={{ fbp, fbc }}>
      {children}
    </MetaCookieContext.Provider>
  );
}

export const useMetaCookies = () => useContext(MetaCookieContext);
