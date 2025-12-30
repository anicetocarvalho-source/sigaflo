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
      agricultural_certificates: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string
          crops: string[]
          expiry_date: string | null
          farmer_id: string
          id: string
          issue_date: string | null
          issued_at: string | null
          issued_by: string | null
          production_history_id: string | null
          qr_code_data: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          season: string
          status: Database["public"]["Enums"]["workflow_status"]
          submitted_at: string | null
          submitted_by: string | null
          total_area_ha: number | null
          total_quantity_kg: number | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          verification_url: string | null
          year: number
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          certificate_number: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          crops: string[]
          expiry_date?: string | null
          farmer_id: string
          id?: string
          issue_date?: string | null
          issued_at?: string | null
          issued_by?: string | null
          production_history_id?: string | null
          qr_code_data?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          season: string
          status?: Database["public"]["Enums"]["workflow_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          total_area_ha?: number | null
          total_quantity_kg?: number | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          verification_url?: string | null
          year: number
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          certificate_number?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          crops?: string[]
          expiry_date?: string | null
          farmer_id?: string
          id?: string
          issue_date?: string | null
          issued_at?: string | null
          issued_by?: string | null
          production_history_id?: string | null
          qr_code_data?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          season?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          total_area_ha?: number | null
          total_quantity_kg?: number | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          verification_url?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "agricultural_certificates_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agricultural_certificates_production_history_id_fkey"
            columns: ["production_history_id"]
            isOneToOne: false
            referencedRelation: "production_history"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
          user_ip: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      communes: {
        Row: {
          code: string | null
          created_at: string
          id: string
          municipality_id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          municipality_id: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          municipality_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "communes_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          address: string | null
          bi_nif: string | null
          commune_id: string | null
          created_at: string
          created_by: string | null
          cultivated_area_ha: number | null
          email: string | null
          farmer_type: Database["public"]["Enums"]["farmer_type"]
          field_school_id: string | null
          id: string
          irrigation_type: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          main_crops: string[] | null
          municipality_id: string | null
          name: string
          parent_cooperative_id: string | null
          phone: string | null
          province_id: string | null
          registration_date: string | null
          registration_number: string | null
          secondary_crops: string[] | null
          status: Database["public"]["Enums"]["workflow_status"] | null
          total_area_ha: number | null
          trade_name: string | null
          updated_at: string
          updated_by: string | null
          village: string | null
        }
        Insert: {
          address?: string | null
          bi_nif?: string | null
          commune_id?: string | null
          created_at?: string
          created_by?: string | null
          cultivated_area_ha?: number | null
          email?: string | null
          farmer_type?: Database["public"]["Enums"]["farmer_type"]
          field_school_id?: string | null
          id?: string
          irrigation_type?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_crops?: string[] | null
          municipality_id?: string | null
          name: string
          parent_cooperative_id?: string | null
          phone?: string | null
          province_id?: string | null
          registration_date?: string | null
          registration_number?: string | null
          secondary_crops?: string[] | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          total_area_ha?: number | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          village?: string | null
        }
        Update: {
          address?: string | null
          bi_nif?: string | null
          commune_id?: string | null
          created_at?: string
          created_by?: string | null
          cultivated_area_ha?: number | null
          email?: string | null
          farmer_type?: Database["public"]["Enums"]["farmer_type"]
          field_school_id?: string | null
          id?: string
          irrigation_type?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_crops?: string[] | null
          municipality_id?: string | null
          name?: string
          parent_cooperative_id?: string | null
          phone?: string | null
          province_id?: string | null
          registration_date?: string | null
          registration_number?: string | null
          secondary_crops?: string[] | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          total_area_ha?: number | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmers_field_school_id_fkey"
            columns: ["field_school_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmers_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmers_parent_cooperative_id_fkey"
            columns: ["parent_cooperative_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmers_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          province_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          province_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          province_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      production_history: {
        Row: {
          actual_yield_kg: number | null
          area_planted_ha: number | null
          created_at: string
          crop_type: string
          expected_yield_kg: number | null
          farmer_id: string
          harvest_date: string | null
          id: string
          notes: string | null
          quality_grade: string | null
          season: string
          updated_at: string
          year: number
          yield_per_ha: number | null
        }
        Insert: {
          actual_yield_kg?: number | null
          area_planted_ha?: number | null
          created_at?: string
          crop_type: string
          expected_yield_kg?: number | null
          farmer_id: string
          harvest_date?: string | null
          id?: string
          notes?: string | null
          quality_grade?: string | null
          season: string
          updated_at?: string
          year: number
          yield_per_ha?: number | null
        }
        Update: {
          actual_yield_kg?: number | null
          area_planted_ha?: number | null
          created_at?: string
          crop_type?: string
          expected_yield_kg?: number | null
          farmer_id?: string
          harvest_date?: string | null
          id?: string
          notes?: string | null
          quality_grade?: string | null
          season?: string
          updated_at?: string
          year?: number
          yield_per_ha?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_history_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
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
      certificate_type:
        | "production"
        | "organic"
        | "quality"
        | "origin"
        | "good_practices"
      farmer_type:
        | "individual"
        | "family"
        | "cooperative"
        | "field_school"
        | "company"
      workflow_status:
        | "draft"
        | "submitted"
        | "validated"
        | "approved"
        | "issued"
        | "rejected"
        | "expired"
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
    Enums: {
      certificate_type: [
        "production",
        "organic",
        "quality",
        "origin",
        "good_practices",
      ],
      farmer_type: [
        "individual",
        "family",
        "cooperative",
        "field_school",
        "company",
      ],
      workflow_status: [
        "draft",
        "submitted",
        "validated",
        "approved",
        "issued",
        "rejected",
        "expired",
      ],
    },
  },
} as const
