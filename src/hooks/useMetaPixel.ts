import { useCallback, useEffect } from 'react';
import { META_PIXEL_ID, isPixelConfigured } from '@/lib/metaConfig';

// Extend window type for fbq
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

/**
 * Hook for Meta Pixel tracking events
 * Provides functions to track standard Meta events
 */
export function useMetaPixel() {
  // Pixel is already initialized in index.html - just verify it's loaded
  useEffect(() => {
    if (!isPixelConfigured()) {
      console.warn('[MetaPixel] Pixel ID not configured');
      return;
    }

    // Wait for Pixel to load (already in index.html)
    const checkPixel = () => {
      if (window.fbq && import.meta.env.DEV) {
        console.log('[MetaPixel] Pixel detected and ready');
      }
    };
    
    checkPixel();
    // Re-check in case it hasn't loaded yet
    const timeout = setTimeout(checkPixel, 1000);
    return () => clearTimeout(timeout);
  }, []);

  /**
   * Track when user clicks "Começar" button
   */
  const trackInitiateCheckout = useCallback(() => {
    if (!isPixelConfigured() || !window.fbq) {
      console.warn('[MetaPixel] Cannot track - pixel not initialized');
      return null;
    }

    const eventId = `ic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    window.fbq('track', 'InitiateCheckout', {}, { eventID: eventId });
    if (import.meta.env.DEV) console.log('[MetaPixel] Tracked InitiateCheckout, eventId:', eventId);
    
    return eventId;
  }, []);

  /**
   * Track when user views results
   */
  const trackViewContent = useCallback((contentName: string, contentCategory?: string) => {
    if (!isPixelConfigured() || !window.fbq) {
      console.warn('[MetaPixel] Cannot track - pixel not initialized');
      return null;
    }

    const eventId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory || 'Diagnóstico',
    }, { eventID: eventId });
    
    if (import.meta.env.DEV) console.log('[MetaPixel] Tracked ViewContent:', contentName, 'eventId:', eventId);
    
    return eventId;
  }, []);

  /**
   * Track when user submits lead form with advanced matching
   * Uses external eventId (lead_id) for deduplication with CAPI
   */
  const trackLead = useCallback((params: {
    eventId: string;  // Required - lead_id from database
    email?: string;
    phone?: string;
    value?: number;
  }) => {
    if (!isPixelConfigured() || !window.fbq) {
      console.warn('[MetaPixel] Cannot track - pixel not initialized');
      return null;
    }

    // Advanced matching data (unhashed - Pixel handles hashing)
    const advancedMatchingData: Record<string, string> = {};
    if (params.email) {
      advancedMatchingData.em = params.email.toLowerCase().trim();
    }
    if (params.phone) {
      // Remove non-digits for phone
      advancedMatchingData.ph = params.phone.replace(/\D/g, '');
    }

    // Update user data with advanced matching if available
    if (Object.keys(advancedMatchingData).length > 0) {
      window.fbq('init', META_PIXEL_ID, advancedMatchingData);
      if (import.meta.env.DEV) console.log('[MetaPixel] Advanced matching applied:', Object.keys(advancedMatchingData));
    }

    window.fbq('track', 'Lead', {
      value: params.value || 0,
      currency: 'BRL',
    }, { eventID: params.eventId });
    
    if (import.meta.env.DEV) console.log('[MetaPixel] Tracked Lead with eventId:', params.eventId);
    
    return params.eventId;
  }, []);

  return {
    trackInitiateCheckout,
    trackViewContent,
    trackLead,
    isConfigured: isPixelConfigured(),
  };
}
