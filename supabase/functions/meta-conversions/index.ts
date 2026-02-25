import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Zod schema for input validation
const conversionEventSchema = z.object({
  event_name: z.enum(['ViewContent', 'Lead']),
  event_id: z.string().min(1).max(200),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
  content_name: z.string().max(200).optional(),
  content_category: z.string().max(200).optional(),
  value: z.number().min(0).max(1_000_000).optional(),
  currency: z.string().max(10).optional(),
  external_id: z.string().max(200).optional(),
  event_source_url: z.string().url().max(2000).optional(),
  fbp: z.string().max(500).optional(),
  fbc: z.string().max(500).optional(),
  client_ip: z.string().max(100).optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  country: z.string().max(10).optional(),
});

/**
 * Hash data using SHA-256 (required by Meta Conversions API)
 */
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 'unknown';
    
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.error('[meta-conversions] Missing META_PIXEL_ID or META_ACCESS_TOKEN');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = conversionEventSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = parsed.data;
    console.log('[meta-conversions] Event:', body.event_name, 'id:', body.event_id);

    // Build user data with hashed PII
    const userData: Record<string, string> = {};
    
    if (body.email) userData.em = await hashData(body.email);
    if (body.phone) userData.ph = await hashData(body.phone.replace(/\D/g, ''));
    if (body.external_id) userData.external_id = await hashData(body.external_id);
    if (body.fbp) userData.fbp = body.fbp;
    if (body.fbc) userData.fbc = body.fbc;
    if (body.first_name) userData.fn = await hashData(body.first_name);
    if (body.last_name) userData.ln = await hashData(body.last_name);
    if (body.country) userData.country = await hashData(body.country);

    const headerIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const clientIp = body.client_ip || headerIp;
    const userAgent = req.headers.get('user-agent') || '';

    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;

    // Build event data
    const eventData: Record<string, any> = {
      event_name: body.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      action_source: 'website',
      user_data: userData,
    };

    if (body.event_source_url) eventData.event_source_url = body.event_source_url;

    if (body.event_name === 'ViewContent') {
      eventData.custom_data = {
        content_name: body.content_name || 'Diagnóstico AF',
        content_category: body.content_category || 'Lead Generation',
      };
    } else if (body.event_name === 'Lead') {
      eventData.custom_data = {
        value: body.value || 0,
        currency: body.currency || 'BRL',
      };
    }

    // Send to Meta Conversions API
    const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [eventData],
        access_token: META_ACCESS_TOKEN,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('[meta-conversions] Meta API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Meta API error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_received: result.events_received,
        fbtrace_id: result.fbtrace_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[meta-conversions] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
