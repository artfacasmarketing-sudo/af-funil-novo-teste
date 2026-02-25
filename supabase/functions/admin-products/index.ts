import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limit
const ipRequests = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, maxReq = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.reset) {
    ipRequests.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxReq;
}

// Validation schemas
const productDataSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  image_url: z.string().url().max(2000),
  price_min: z.number().min(0).max(1_000_000),
  price_max: z.number().min(0).max(1_000_000),
  categories: z.array(z.string().max(100)).max(20).optional(),
  colors: z.array(z.string().max(50)).max(30).optional(),
  color_images: z.record(z.string().max(2000)).optional(),
  color_skus: z.record(z.string().max(100)).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(10000).optional(),
});

const deleteDataSchema = z.object({
  id: z.string().uuid(),
});

const requestSchema = z.object({
  action: z.enum(["list", "create", "update", "delete"]),
  password: z.string().min(1).max(200),
  data: z.any().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reqParsed = requestSchema.safeParse(rawBody);
    if (!reqParsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, password, data } = reqParsed.data;

    // Validate password
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      case "list": {
        const { data: products, error } = await supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ products }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        const parsed = productDataSchema.safeParse(data);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Invalid product data" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const d = parsed.data;
        const { data: product, error } = await supabase
          .from("products")
          .insert({
            name: d.name,
            sku: d.sku,
            image_url: d.image_url,
            price_min: d.price_min,
            price_max: d.price_max,
            categories: d.categories || [],
            colors: d.colors || [],
            color_images: d.color_images || {},
            color_skus: d.color_skus || {},
            active: d.active ?? true,
            sort_order: d.sort_order || 0,
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ product }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        const parsed = productDataSchema.safeParse(data);
        if (!parsed.success || !parsed.data.id) {
          return new Response(JSON.stringify({ error: "Invalid product data or missing ID" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const d = parsed.data;
        const { data: product, error } = await supabase
          .from("products")
          .update({
            name: d.name,
            sku: d.sku,
            image_url: d.image_url,
            price_min: d.price_min,
            price_max: d.price_max,
            categories: d.categories,
            colors: d.colors,
            color_images: d.color_images,
            color_skus: d.color_skus,
            active: d.active,
            sort_order: d.sort_order,
          })
          .eq("id", d.id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ product }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const parsed = deleteDataSchema.safeParse(data);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Invalid ID" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", parsed.data.id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
