import { supabase } from '@/integrations/supabase/client';

interface ConversionEventData {
  eventName: 'ViewContent' | 'Lead';
  eventId: string;
  email?: string;
  phone?: string;
  contentName?: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
  // Fields for improved EMQ
  externalId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  firstName?: string;  // fn - hashed
  lastName?: string;   // ln - hashed
  country?: string;    // country - hashed
}

/**
 * Send conversion event to Meta Conversions API via edge function
 * This provides server-side tracking that isn't blocked by ad blockers
 */
export async function sendConversionEvent(data: ConversionEventData): Promise<boolean> {
  try {
    console.log('[MetaConversions] Sending event:', data.eventName, 'eventId:', data.eventId);

    const { data: response, error } = await supabase.functions.invoke('meta-conversions', {
      body: {
        event_name: data.eventName,
        event_id: data.eventId,
        email: data.email,
        phone: data.phone,
        content_name: data.contentName,
        content_category: data.contentCategory,
        value: data.value,
        currency: data.currency,
        // New fields for improved EMQ
        external_id: data.externalId,
        event_source_url: data.eventSourceUrl,
        fbp: data.fbp,
        fbc: data.fbc,
        client_ip: data.clientIp,
        first_name: data.firstName,
        last_name: data.lastName,
        country: data.country,
      },
    });

    if (error) {
      console.error('[MetaConversions] Edge function error:', error);
      return false;
    }

    console.log('[MetaConversions] Response:', response);
    return response?.success || false;
  } catch (err) {
    console.error('[MetaConversions] Unexpected error:', err);
    return false;
  }
}

/**
 * Track ViewContent event (browser + server)
 */
export async function trackViewContentServer(
  eventId: string,
  contentName: string,
  contentCategory?: string
): Promise<boolean> {
  return sendConversionEvent({
    eventName: 'ViewContent',
    eventId,
    contentName,
    contentCategory,
  });
}

/**
 * Track Lead event (browser + server) with full EMQ data
 */
export async function trackLeadServer(params: {
  eventId: string;
  email?: string;
  phone?: string;
  value?: number;
  externalId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}): Promise<boolean> {
  return sendConversionEvent({
    eventName: 'Lead',
    eventId: params.eventId,
    email: params.email,
    phone: params.phone,
    value: params.value,
    currency: 'BRL',
    externalId: params.externalId,
    eventSourceUrl: params.eventSourceUrl,
    fbp: params.fbp,
    fbc: params.fbc,
    clientIp: params.clientIp,
    firstName: params.firstName,
    lastName: params.lastName,
    country: params.country,
  });
}
