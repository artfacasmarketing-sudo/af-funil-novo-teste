import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const N8N_WEBHOOK = Deno.env.get('N8N_WEBHOOK_URL')

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false
  }
  
  entry.count++
  return true
}

// Input validation schema
const colorsSchema = z.object({
  brand_colors: z.boolean().optional().default(false),
  selected: z.array(z.string().max(50)).max(20).optional().default([]),
  codes: z.string().max(500).optional().default(''),
}).optional()

const utmSchema = z.object({
  source: z.string().max(200).optional().nullable(),
  medium: z.string().max(200).optional().nullable(),
  campaign: z.string().max(200).optional().nullable(),
  content: z.string().max(200).optional().nullable(),
  term: z.string().max(200).optional().nullable(),
}).optional()

const leadSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo').trim(),
  whatsapp: z.string()
    .min(10, 'WhatsApp inválido')
    .max(20, 'WhatsApp inválido')
    .regex(/^[\d\s\-\+\(\)]+$/, 'WhatsApp deve conter apenas números'),
  email: z.string().email('Email inválido').max(255).optional().nullable()
    .or(z.literal('')).or(z.literal(null)),
  company: z.string().max(200).optional().nullable(),
  goal: z.string().max(200).optional().nullable(),
  occasion: z.string().max(200).optional().nullable(),
  audience: z.string().max(200).optional().nullable(),
  niche: z.string().max(500).optional().nullable(),
  quantity_range: z.string().max(100).optional().nullable(),
  budget_range: z.string().max(100).optional().nullable(),
  deadline_range: z.string().max(100).optional().nullable(),
  categories: z.array(z.string().max(100)).max(20).optional().default([]),
  path_chosen: z.string().max(100).optional().nullable(),
  colors: colorsSchema,
  file_urls: z.array(z.string().url().max(500)).max(10).optional().default([]),
  selected_products: z.array(
    z.union([
      z.string().max(200),
      z.object({ name: z.string().max(200), sku: z.string().max(100) }),
    ])
  ).max(50).optional().default([]),
  must_have: z.string().max(1000).optional().nullable(),
  document_type: z.enum(['cpf', 'cnpj']).optional().nullable(),
  document_number: z.string().max(20).optional().nullable(),
  state_registration: z.string().max(30).optional().nullable(),
  presentation_preference: z.enum(['whatsapp', 'call']).optional().nullable(),
  scheduled_date: z.string().max(20).optional().nullable(),
  scheduled_time: z.string().max(10).optional().nullable(),
  utm: utmSchema,
  referrer: z.string().max(500).optional().nullable(),
  page_url: z.string().max(500).optional().nullable(),
})

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown'
    
    if (!checkRateLimit(clientIP)) {
      console.log('[submit-lead] Rate limit exceeded for IP:', clientIP)
      return new Response(
        JSON.stringify({ success: false, error: 'Muitas requisições. Tente novamente em 1 minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate payload
    let rawPayload: unknown
    try {
      rawPayload = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validationResult = leadSchema.safeParse(rawPayload)
    
    if (!validationResult.success) {
      // Log detailed errors for debugging, but don't expose to client
      console.log('[submit-lead] Validation failed:', JSON.stringify(validationResult.error.errors))
      return new Response(
        JSON.stringify({ success: false, error: 'Dados inválidos. Verifique os campos.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = validationResult.data
    console.log('[submit-lead] Validated payload for:', payload.name)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Insert lead into database with validated data
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        name: payload.name,
        whatsapp: payload.whatsapp,
        email: payload.email || null,
        company: payload.company || null,
        goal: payload.goal || null,
        occasion: payload.occasion || null,
        audience: payload.audience || null,
        niche: payload.niche || null,
        quantity_range: payload.quantity_range || null,
        budget_range: payload.budget_range || null,
        deadline_range: payload.deadline_range || null,
        categories: payload.categories || [],
        path_chosen: payload.path_chosen || null,
        brand_colors: payload.colors?.brand_colors || false,
        selected_colors: payload.colors?.selected || [],
        color_codes: payload.colors?.codes || null,
        file_urls: payload.file_urls || [],
        selected_products: payload.selected_products || [],
        must_have: payload.must_have || null,
        document_type: payload.document_type || null,
        document_number: payload.document_number || null,
        state_registration: payload.state_registration || null,
        presentation_preference: payload.presentation_preference || null,
        scheduled_date: payload.scheduled_date || null,
        scheduled_time: payload.scheduled_time || null,
        utm_source: payload.utm?.source || null,
        utm_medium: payload.utm?.medium || null,
        utm_campaign: payload.utm?.campaign || null,
        utm_content: payload.utm?.content || null,
        utm_term: payload.utm?.term || null,
        referrer: payload.referrer || null,
        page_url: payload.page_url || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[submit-lead] Database error:', dbError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao salvar. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[submit-lead] Lead saved with ID:', lead.id)

    // Generate signed URLs for uploaded files (valid for 7 days)
    let signedFileUrls: string[] = []
    if (payload.file_urls && payload.file_urls.length > 0) {
      signedFileUrls = await Promise.all(
        payload.file_urls.map(async (url: string) => {
          // Extract path from public URL
          const pathMatch = url.match(/brand-files\/(.+)$/)
          if (pathMatch && pathMatch[1]) {
            const { data, error } = await supabase.storage
              .from('brand-files')
              .createSignedUrl(pathMatch[1], 60 * 60 * 24 * 7) // 7 days
            if (!error && data?.signedUrl) {
              console.log('[submit-lead] Generated signed URL for:', pathMatch[1])
              return data.signedUrl
            }
          }
          return url // fallback to original URL
        })
      )
    }

    // Send to n8n webhook
    let webhookSent = false
    const webhookUrl = N8N_WEBHOOK
    
    if (webhookUrl) {
      try {
        const webhookPayload = {
          ...payload,
          file_urls: signedFileUrls.length > 0 ? signedFileUrls : payload.file_urls, // Use signed URLs
          lead_id: lead.id,
          timestamp: lead.created_at,
          source: 'lovable-cloud',
        }

        console.log('[submit-lead] Sending to n8n webhook...')
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        })

        console.log('[submit-lead] Webhook response status:', webhookResponse.status)
        webhookSent = webhookResponse.ok

        if (webhookSent) {
          await supabase
            .from('leads')
            .update({ 
              webhook_sent: true, 
              webhook_sent_at: new Date().toISOString() 
            })
            .eq('id', lead.id)
        }
      } catch (webhookError) {
        console.error('[submit-lead] Webhook error (lead still saved):', webhookError)
      }
    } else {
      console.warn('[submit-lead] N8N_WEBHOOK_URL not configured, skipping webhook')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        webhook_sent: webhookSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[submit-lead] Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro inesperado. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
