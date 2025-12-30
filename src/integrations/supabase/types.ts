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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          entity_id: string | null
          full_name: string
          id: string
          is_active: boolean
          municipality_id: string | null
          phone: string | null
          position: string | null
          province_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          entity_id?: string | null
          full_name: string
          id: string
          is_active?: boolean
          municipality_id?: string | null
          phone?: string | null
          position?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          entity_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          municipality_id?: string | null
          phone?: string | null
          position?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
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
      rice_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_value: number | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          metric_name: string | null
          province_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threshold_value: number | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          metric_name?: string | null
          province_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threshold_value?: number | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          metric_name?: string | null
          province_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threshold_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rice_alerts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      rice_consumption: {
        Row: {
          created_at: string
          data_source: string | null
          id: string
          notes: string | null
          per_capita_kg: number
          population: number
          province_id: string | null
          total_consumption_tonnes: number | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          id?: string
          notes?: string | null
          per_capita_kg: number
          population: number
          province_id?: string | null
          total_consumption_tonnes?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          data_source?: string | null
          id?: string
          notes?: string | null
          per_capita_kg?: number
          population?: number
          province_id?: string | null
          total_consumption_tonnes?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rice_consumption_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      rice_imports: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          importer_name: string | null
          month: number
          notes: string | null
          origin_country: string
          port_of_entry: string | null
          price_cif_usd: number | null
          price_fob_usd: number | null
          rice_type: string | null
          total_value_usd: number | null
          updated_at: string
          volume_tonnes: number
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          importer_name?: string | null
          month: number
          notes?: string | null
          origin_country: string
          port_of_entry?: string | null
          price_cif_usd?: number | null
          price_fob_usd?: number | null
          rice_type?: string | null
          total_value_usd?: number | null
          updated_at?: string
          volume_tonnes?: number
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          importer_name?: string | null
          month?: number
          notes?: string | null
          origin_country?: string
          port_of_entry?: string | null
          price_cif_usd?: number | null
          price_fob_usd?: number | null
          rice_type?: string | null
          total_value_usd?: number | null
          updated_at?: string
          volume_tonnes?: number
          year?: number
        }
        Relationships: []
      }
      rice_parameters: {
        Row: {
          description: string | null
          id: string
          parameter_name: string
          parameter_value: number
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          parameter_name: string
          parameter_value: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          parameter_name?: string
          parameter_value?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rice_prices: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          exchange_rate_usd: number | null
          id: string
          market_name: string | null
          notes: string | null
          province_id: string | null
          recorded_date: string
          retail_price_aoa: number
          rice_type: string | null
          wholesale_price_aoa: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          exchange_rate_usd?: number | null
          id?: string
          market_name?: string | null
          notes?: string | null
          province_id?: string | null
          recorded_date: string
          retail_price_aoa: number
          rice_type?: string | null
          wholesale_price_aoa?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          exchange_rate_usd?: number | null
          id?: string
          market_name?: string | null
          notes?: string | null
          province_id?: string | null
          recorded_date?: string
          retail_price_aoa?: number
          rice_type?: string | null
          wholesale_price_aoa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rice_prices_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      rice_production: {
        Row: {
          created_at: string
          created_by: string | null
          cultivated_area_ha: number
          harvested_area_ha: number
          id: string
          irrigation_type: string | null
          municipality_id: string | null
          notes: string | null
          production_tonnes: number
          productivity_kg_ha: number | null
          province_id: string | null
          season: string
          updated_at: string
          variety: string | null
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cultivated_area_ha?: number
          harvested_area_ha?: number
          id?: string
          irrigation_type?: string | null
          municipality_id?: string | null
          notes?: string | null
          production_tonnes?: number
          productivity_kg_ha?: number | null
          province_id?: string | null
          season?: string
          updated_at?: string
          variety?: string | null
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cultivated_area_ha?: number
          harvested_area_ha?: number
          id?: string
          irrigation_type?: string | null
          municipality_id?: string | null
          notes?: string | null
          production_tonnes?: number
          productivity_kg_ha?: number | null
          province_id?: string | null
          season?: string
          updated_at?: string
          variety?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rice_production_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rice_production_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_user: {
        Args: {
          _manager_id: string
          _target_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      get_user_municipality: { Args: { _user_id: string }; Returns: string }
      get_user_province: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_national_level: { Args: { _user_id: string }; Returns: boolean }
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
      user_role:
        | "admin_national"
        | "admin_provincial"
        | "admin_municipal"
        | "technician_national"
        | "technician_provincial"
        | "technician_municipal"
        | "private_entity"
        | "viewer"
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
      user_role: [
        "admin_national",
        "admin_provincial",
        "admin_municipal",
        "technician_national",
        "technician_provincial",
        "technician_municipal",
        "private_entity",
        "viewer",
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
