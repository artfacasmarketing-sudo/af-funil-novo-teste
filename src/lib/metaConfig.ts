/**
 * Meta Pixel Configuration
 * 
 * The Pixel ID is stored here as it's a public identifier (visible in page source).
 * The Access Token is stored securely as a Supabase secret for server-side use.
 */

// Meta Pixel ID - This is public and safe to expose (visible in page source of any website)
export const META_PIXEL_ID = '1557920551927585';

// Check if pixel is configured
export const isPixelConfigured = (): boolean => {
  return META_PIXEL_ID.length > 0;
};
