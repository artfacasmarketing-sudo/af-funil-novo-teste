export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          audience: string | null
          brand_colors: boolean | null
          budget_range: string | null
          categories: string[] | null
          color_codes: string | null
          company: string | null
          created_at: string | null
          deadline_range: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          file_urls: string[] | null
          goal: string | null
          id: string
          must_have: string | null
          name: string
          niche: string | null
          occasion: string | null
          page_url: string | null
          path_chosen: string | null
          presentation_preference: string | null
          quantity_range: string | null
          referrer: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          selected_colors: string[] | null
          selected_products: string[] | null
          state_registration: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          webhook_sent: boolean | null
          webhook_sent_at: string | null
          whatsapp: string
        }
        Insert: {
          audience?: string | null
          brand_colors?: boolean | null
          budget_range?: string | null
          categories?: string[] | null
          color_codes?: string | null
          company?: string | null
          created_at?: string | null
          deadline_range?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          file_urls?: string[] | null
          goal?: string | null
          id?: string
          must_have?: string | null
          name: string
          niche?: string | null
          occasion?: string | null
          page_url?: string | null
          path_chosen?: string | null
          presentation_preference?: string | null
          quantity_range?: string | null
          referrer?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          selected_colors?: string[] | null
          selected_products?: string[] | null
          state_registration?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          webhook_sent?: boolean | null
          webhook_sent_at?: string | null
          whatsapp: string
        }
        Update: {
          audience?: string | null
          brand_colors?: boolean | null
          budget_range?: string | null
          categories?: string[] | null
          color_codes?: string | null
          company?: string | null
          created_at?: string | null
          deadline_range?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          file_urls?: string[] | null
          goal?: string | null
          id?: string
          must_have?: string | null
          name?: string
          niche?: string | null
          occasion?: string | null
          page_url?: string | null
          path_chosen?: string | null
          presentation_preference?: string | null
          quantity_range?: string | null
          referrer?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          selected_colors?: string[] | null
          selected_products?: string[] | null
          state_registration?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          webhook_sent?: boolean | null
          webhook_sent_at?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          categories: string[]
          color_images: Json
          color_skus: Json
          colors: string[]
          created_at: string
          id: string
          image_url: string
          name: string
          price_max: number
          price_min: number
          sku: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          categories?: string[]
          color_images?: Json
          color_skus?: Json
          colors?: string[]
          created_at?: string
          id?: string
          image_url: string
          name: string
          price_max: number
          price_min: number
          sku: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          categories?: string[]
          color_images?: Json
          color_skus?: Json
          colors?: string[]
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          price_max?: number
          price_min?: number
          sku?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
