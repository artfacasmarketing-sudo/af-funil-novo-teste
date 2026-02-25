/**
 * Meta Pixel Cookie Utilities
 * 
 * Captures _fbp and _fbc cookies for server-side tracking
 * These cookies are set by the Meta Pixel and help with user matching
 * 
 * IMPORTANT: _fbc is case-sensitive - do NOT convert to lowercase
 */

export interface MetaCookies {
  fbp?: string;
  fbc?: string;
}

/**
 * Get Meta Pixel cookies (_fbp and _fbc) from the browser
 * 
 * _fbp: Facebook Browser ID - identifies a browser session
 * _fbc: Facebook Click ID - tracks click ID from fb ads (fbclid parameter)
 * 
 * NOTE: Preserves original case - _fbc is case-sensitive!
 */
export function getMetaCookies(): MetaCookies {
  if (typeof document === 'undefined') {
    return {};
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key) {
      // Preserve original value - DO NOT use toLowerCase()
      // _fbc is case-sensitive per Meta documentation
      acc[key] = valueParts.join('=');
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    fbp: cookies['_fbp'] || undefined,
    fbc: cookies['_fbc'] || undefined, // Case-sensitive!
  };
}

/**
 * Check if Meta Pixel cookies are available
 */
export function hasMetaCookies(): boolean {
  const { fbp, fbc } = getMetaCookies();
  return !!(fbp || fbc);
}
