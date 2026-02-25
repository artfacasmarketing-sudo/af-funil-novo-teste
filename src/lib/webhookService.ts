// UTM and Page Tracking Utilities

interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

// Get UTM parameters from URL
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return { source: '', medium: '', campaign: '', content: '', term: '' };
  }
  
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || '',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
  };
}

// Get referrer
export function getReferrer(): string {
  if (typeof document === 'undefined') return '';
  return document.referrer || '';
}

// Get current page URL (clean, without internal tokens)
export function getPageURL(): string {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location.href);
  
  // Remove internal/sensitive parameters
  const paramsToRemove = ['__lovable_token', '__lovable_preview'];
  paramsToRemove.forEach(param => url.searchParams.delete(param));
  
  // Truncate to 500 chars max to stay within validation limits
  const cleanUrl = url.toString();
  return cleanUrl.length > 500 ? cleanUrl.substring(0, 500) : cleanUrl;
}
