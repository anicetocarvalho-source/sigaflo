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
      climate_occurrences: {
        Row: {
          affected_area_ha: number | null
          affected_farmers_count: number | null
          ai_classification: Json | null
          assigned_to: string | null
          best_practices: string[] | null
          commune_id: string | null
          created_at: string
          description: string | null
          estimated_loss_aoa: number | null
          id: string
          latitude: number | null
          longitude: number | null
          municipality_id: string | null
          occurrence_type: string
          province_id: string | null
          report_date: string
          reported_by: string | null
          resolution_date: string | null
          resolution_notes: string | null
          severity: string
          source: string
          source_phone: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_area_ha?: number | null
          affected_farmers_count?: number | null
          ai_classification?: Json | null
          assigned_to?: string | null
          best_practices?: string[] | null
          commune_id?: string | null
          created_at?: string
          description?: string | null
          estimated_loss_aoa?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          occurrence_type: string
          province_id?: string | null
          report_date?: string
          reported_by?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          severity?: string
          source?: string
          source_phone?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_area_ha?: number | null
          affected_farmers_count?: number | null
          ai_classification?: Json | null
          assigned_to?: string | null
          best_practices?: string[] | null
          commune_id?: string | null
          created_at?: string
          description?: string | null
          estimated_loss_aoa?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          occurrence_type?: string
          province_id?: string | null
          report_date?: string
          reported_by?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          severity?: string
          source?: string
          source_phone?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "climate_occurrences_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "climate_occurrences_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "climate_occurrences_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
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
      forest_checkpoint_logs: {
        Row: {
          arrival_at: string
          cargo_verified: boolean | null
          checkpoint_id: string
          created_at: string
          decision: string | null
          departure_at: string | null
          detention_reason: string | null
          discrepancies_found: boolean | null
          discrepancy_notes: string | null
          documents_verified: boolean | null
          id: string
          inspector_id: string | null
          inspector_name: string | null
          notes: string | null
          photos: Json | null
          species_matches: boolean | null
          transport_permit_id: string
          volume_matches: boolean | null
        }
        Insert: {
          arrival_at?: string
          cargo_verified?: boolean | null
          checkpoint_id: string
          created_at?: string
          decision?: string | null
          departure_at?: string | null
          detention_reason?: string | null
          discrepancies_found?: boolean | null
          discrepancy_notes?: string | null
          documents_verified?: boolean | null
          id?: string
          inspector_id?: string | null
          inspector_name?: string | null
          notes?: string | null
          photos?: Json | null
          species_matches?: boolean | null
          transport_permit_id: string
          volume_matches?: boolean | null
        }
        Update: {
          arrival_at?: string
          cargo_verified?: boolean | null
          checkpoint_id?: string
          created_at?: string
          decision?: string | null
          departure_at?: string | null
          detention_reason?: string | null
          discrepancies_found?: boolean | null
          discrepancy_notes?: string | null
          documents_verified?: boolean | null
          id?: string
          inspector_id?: string | null
          inspector_name?: string | null
          notes?: string | null
          photos?: Json | null
          species_matches?: boolean | null
          transport_permit_id?: string
          volume_matches?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_checkpoint_logs_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "forest_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_checkpoint_logs_transport_permit_id_fkey"
            columns: ["transport_permit_id"]
            isOneToOne: false
            referencedRelation: "forest_transport_permits"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_checkpoints: {
        Row: {
          address: string | null
          checkpoint_type: string
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          municipality_id: string | null
          name: string
          operating_hours: string | null
          province_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          checkpoint_type?: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          municipality_id?: string | null
          name: string
          operating_hours?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          checkpoint_type?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          municipality_id?: string | null
          name?: string
          operating_hours?: string | null
          province_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forest_checkpoints_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_checkpoints_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_complaints: {
        Row: {
          actions_taken: string | null
          assigned_at: string | null
          assigned_to: string | null
          commune_id: string | null
          complainant_email: string | null
          complainant_name: string | null
          complainant_phone: string | null
          complaint_number: string
          complaint_type: string
          created_at: string
          description: string
          id: string
          infraction_id: string | null
          investigation_notes: string | null
          is_anonymous: boolean | null
          latitude: number | null
          location_description: string
          longitude: number | null
          municipality_id: string | null
          occurrence_date: string | null
          photos: Json | null
          province_id: string | null
          received_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          verification_result: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          actions_taken?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          commune_id?: string | null
          complainant_email?: string | null
          complainant_name?: string | null
          complainant_phone?: string | null
          complaint_number: string
          complaint_type: string
          created_at?: string
          description: string
          id?: string
          infraction_id?: string | null
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          latitude?: number | null
          location_description: string
          longitude?: number | null
          municipality_id?: string | null
          occurrence_date?: string | null
          photos?: Json | null
          province_id?: string | null
          received_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          verification_result?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          actions_taken?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          commune_id?: string | null
          complainant_email?: string | null
          complainant_name?: string | null
          complainant_phone?: string | null
          complaint_number?: string
          complaint_type?: string
          created_at?: string
          description?: string
          id?: string
          infraction_id?: string | null
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          latitude?: number | null
          location_description?: string
          longitude?: number | null
          municipality_id?: string | null
          occurrence_date?: string | null
          photos?: Json | null
          province_id?: string | null
          received_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          verification_result?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_complaints_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_complaints_infraction_id_fkey"
            columns: ["infraction_id"]
            isOneToOne: false
            referencedRelation: "forest_infractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_complaints_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_complaints_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_infractions: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          closed_by: string | null
          closure_notes: string | null
          contest_date: string | null
          contest_decision: string | null
          contest_decision_date: string | null
          contest_reason: string | null
          contested: boolean | null
          created_at: string
          description: string
          evidence_description: string | null
          fine_amount_aoa: number | null
          fine_paid: boolean | null
          fine_paid_at: string | null
          id: string
          infraction_number: string
          infraction_type: Database["public"]["Enums"]["infraction_type"]
          infractor_address: string | null
          infractor_document: string | null
          infractor_name: string | null
          investigated_at: string | null
          investigation_notes: string | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          municipality_id: string | null
          occurrence_date: string
          operator_id: string | null
          photos: Json | null
          province_id: string | null
          related_license_id: string | null
          related_transport_id: string | null
          reported_at: string | null
          reported_by: string | null
          sanction_type: string | null
          seized_materials: Json | null
          seized_species: string[] | null
          seized_volume_m3: number | null
          severity: string
          status: Database["public"]["Enums"]["infraction_status"]
          suspension_days: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          contest_date?: string | null
          contest_decision?: string | null
          contest_decision_date?: string | null
          contest_reason?: string | null
          contested?: boolean | null
          created_at?: string
          description: string
          evidence_description?: string | null
          fine_amount_aoa?: number | null
          fine_paid?: boolean | null
          fine_paid_at?: string | null
          id?: string
          infraction_number: string
          infraction_type: Database["public"]["Enums"]["infraction_type"]
          infractor_address?: string | null
          infractor_document?: string | null
          infractor_name?: string | null
          investigated_at?: string | null
          investigation_notes?: string | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          municipality_id?: string | null
          occurrence_date: string
          operator_id?: string | null
          photos?: Json | null
          province_id?: string | null
          related_license_id?: string | null
          related_transport_id?: string | null
          reported_at?: string | null
          reported_by?: string | null
          sanction_type?: string | null
          seized_materials?: Json | null
          seized_species?: string[] | null
          seized_volume_m3?: number | null
          severity?: string
          status?: Database["public"]["Enums"]["infraction_status"]
          suspension_days?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          contest_date?: string | null
          contest_decision?: string | null
          contest_decision_date?: string | null
          contest_reason?: string | null
          contested?: boolean | null
          created_at?: string
          description?: string
          evidence_description?: string | null
          fine_amount_aoa?: number | null
          fine_paid?: boolean | null
          fine_paid_at?: string | null
          id?: string
          infraction_number?: string
          infraction_type?: Database["public"]["Enums"]["infraction_type"]
          infractor_address?: string | null
          infractor_document?: string | null
          infractor_name?: string | null
          investigated_at?: string | null
          investigation_notes?: string | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          municipality_id?: string | null
          occurrence_date?: string
          operator_id?: string | null
          photos?: Json | null
          province_id?: string | null
          related_license_id?: string | null
          related_transport_id?: string | null
          reported_at?: string | null
          reported_by?: string | null
          sanction_type?: string | null
          seized_materials?: Json | null
          seized_species?: string[] | null
          seized_volume_m3?: number | null
          severity?: string
          status?: Database["public"]["Enums"]["infraction_status"]
          suspension_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forest_infractions_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_infractions_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "forest_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_infractions_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_infractions_related_license_id_fkey"
            columns: ["related_license_id"]
            isOneToOne: false
            referencedRelation: "forest_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_infractions_related_transport_id_fkey"
            columns: ["related_transport_id"]
            isOneToOne: false
            referencedRelation: "forest_transport_permits"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_licenses: {
        Row: {
          application_date: string | null
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          authorized_species: string[] | null
          authorized_volume_m3: number | null
          commune_id: string | null
          concession_area_ha: number | null
          concession_area_name: string | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          fee_paid: boolean | null
          harvested_volume_m3: number | null
          id: string
          issue_date: string | null
          latitude: number | null
          license_fee_aoa: number | null
          license_number: string
          license_type: Database["public"]["Enums"]["forest_license_type"]
          longitude: number | null
          municipality_id: string | null
          notes: string | null
          operator_id: string
          payment_date: string | null
          payment_reference: string | null
          province_id: string | null
          qr_code_data: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["forest_license_status"]
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          updated_by: string | null
          verification_url: string | null
        }
        Insert: {
          application_date?: string | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          authorized_species?: string[] | null
          authorized_volume_m3?: number | null
          commune_id?: string | null
          concession_area_ha?: number | null
          concession_area_name?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          fee_paid?: boolean | null
          harvested_volume_m3?: number | null
          id?: string
          issue_date?: string | null
          latitude?: number | null
          license_fee_aoa?: number | null
          license_number: string
          license_type: Database["public"]["Enums"]["forest_license_type"]
          longitude?: number | null
          municipality_id?: string | null
          notes?: string | null
          operator_id: string
          payment_date?: string | null
          payment_reference?: string | null
          province_id?: string | null
          qr_code_data?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["forest_license_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          updated_by?: string | null
          verification_url?: string | null
        }
        Update: {
          application_date?: string | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          authorized_species?: string[] | null
          authorized_volume_m3?: number | null
          commune_id?: string | null
          concession_area_ha?: number | null
          concession_area_name?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          fee_paid?: boolean | null
          harvested_volume_m3?: number | null
          id?: string
          issue_date?: string | null
          latitude?: number | null
          license_fee_aoa?: number | null
          license_number?: string
          license_type?: Database["public"]["Enums"]["forest_license_type"]
          longitude?: number | null
          municipality_id?: string | null
          notes?: string | null
          operator_id?: string
          payment_date?: string | null
          payment_reference?: string | null
          province_id?: string | null
          qr_code_data?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["forest_license_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          updated_by?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_licenses_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_licenses_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_licenses_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "forest_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_licenses_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_logs: {
        Row: {
          created_at: string
          current_latitude: number | null
          current_location_name: string | null
          current_longitude: number | null
          destination_name: string | null
          destination_sawmill_id: string | null
          diameter_cm: number | null
          id: string
          length_m: number | null
          license_id: string
          log_code: string
          logged_at: string | null
          logged_by: string | null
          notes: string | null
          photos: Json | null
          qr_code_data: string | null
          species: string
          status: Database["public"]["Enums"]["tracking_status"]
          tree_id: string | null
          updated_at: string
          volume_m3: number
          wood_class: Database["public"]["Enums"]["wood_classification"]
        }
        Insert: {
          created_at?: string
          current_latitude?: number | null
          current_location_name?: string | null
          current_longitude?: number | null
          destination_name?: string | null
          destination_sawmill_id?: string | null
          diameter_cm?: number | null
          id?: string
          length_m?: number | null
          license_id: string
          log_code: string
          logged_at?: string | null
          logged_by?: string | null
          notes?: string | null
          photos?: Json | null
          qr_code_data?: string | null
          species: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tree_id?: string | null
          updated_at?: string
          volume_m3: number
          wood_class: Database["public"]["Enums"]["wood_classification"]
        }
        Update: {
          created_at?: string
          current_latitude?: number | null
          current_location_name?: string | null
          current_longitude?: number | null
          destination_name?: string | null
          destination_sawmill_id?: string | null
          diameter_cm?: number | null
          id?: string
          length_m?: number | null
          license_id?: string
          log_code?: string
          logged_at?: string | null
          logged_by?: string | null
          notes?: string | null
          photos?: Json | null
          qr_code_data?: string | null
          species?: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tree_id?: string | null
          updated_at?: string
          volume_m3?: number
          wood_class?: Database["public"]["Enums"]["wood_classification"]
        }
        Relationships: [
          {
            foreignKeyName: "forest_logs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "forest_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_logs_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "forest_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_nurseries: {
        Row: {
          address: string | null
          area_ha: number | null
          capacity_seedlings: number | null
          code: string
          created_at: string
          current_stock: number | null
          email: string | null
          established_date: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          municipality_id: string | null
          name: string
          notes: string | null
          nursery_type: string
          operator_id: string | null
          phone: string | null
          photos: Json | null
          province_id: string | null
          species_produced: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_ha?: number | null
          capacity_seedlings?: number | null
          code: string
          created_at?: string
          current_stock?: number | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          municipality_id?: string | null
          name: string
          notes?: string | null
          nursery_type?: string
          operator_id?: string | null
          phone?: string | null
          photos?: Json | null
          province_id?: string | null
          species_produced?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_ha?: number | null
          capacity_seedlings?: number | null
          code?: string
          created_at?: string
          current_stock?: number | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          municipality_id?: string | null
          name?: string
          notes?: string | null
          nursery_type?: string
          operator_id?: string | null
          phone?: string | null
          photos?: Json | null
          province_id?: string | null
          species_produced?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forest_nurseries_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_nurseries_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "forest_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_nurseries_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_operators: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          legal_representative: string | null
          municipality_id: string | null
          name: string
          nif: string
          operator_type: string
          phone: string | null
          province_id: string | null
          registration_number: string | null
          trade_name: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_representative?: string | null
          municipality_id?: string | null
          name: string
          nif: string
          operator_type?: string
          phone?: string | null
          province_id?: string | null
          registration_number?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_representative?: string | null
          municipality_id?: string | null
          name?: string
          nif?: string
          operator_type?: string
          phone?: string | null
          province_id?: string | null
          registration_number?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_operators_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_operators_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_reforestation_activities: {
        Row: {
          activity_date: string
          activity_type: string
          area_covered_ha: number | null
          cost_aoa: number | null
          created_at: string
          created_by: string | null
          id: string
          mortality_count: number | null
          nursery_id: string | null
          observations: string | null
          photos: Json | null
          program_id: string
          seedlings_planted: number | null
          seedlings_replaced: number | null
          species_planted: Json | null
          survival_count: number | null
          team_leader: string | null
          team_size: number | null
        }
        Insert: {
          activity_date: string
          activity_type: string
          area_covered_ha?: number | null
          cost_aoa?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mortality_count?: number | null
          nursery_id?: string | null
          observations?: string | null
          photos?: Json | null
          program_id: string
          seedlings_planted?: number | null
          seedlings_replaced?: number | null
          species_planted?: Json | null
          survival_count?: number | null
          team_leader?: string | null
          team_size?: number | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          area_covered_ha?: number | null
          cost_aoa?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mortality_count?: number | null
          nursery_id?: string | null
          observations?: string | null
          photos?: Json | null
          program_id?: string
          seedlings_planted?: number | null
          seedlings_replaced?: number | null
          species_planted?: Json | null
          survival_count?: number | null
          team_leader?: string | null
          team_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_reforestation_activities_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "forest_nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_reforestation_activities_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "forest_reforestation_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_reforestation_programs: {
        Row: {
          actual_end_date: string | null
          area_polygon: Json | null
          budget_aoa: number | null
          code: string
          coordinator_name: string | null
          coordinator_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          documents: Json | null
          id: string
          implementing_entity: string | null
          latitude: number | null
          longitude: number | null
          municipality_id: string | null
          name: string
          objectives: string | null
          photos: Json | null
          planted_area_ha: number | null
          planted_seedlings: number | null
          program_type: string
          province_id: string | null
          spent_aoa: number | null
          start_date: string
          status: string
          survival_rate: number | null
          target_area_ha: number
          target_end_date: string | null
          target_seedlings: number
          target_species: string[] | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          area_polygon?: Json | null
          budget_aoa?: number | null
          code: string
          coordinator_name?: string | null
          coordinator_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          implementing_entity?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          name: string
          objectives?: string | null
          photos?: Json | null
          planted_area_ha?: number | null
          planted_seedlings?: number | null
          program_type?: string
          province_id?: string | null
          spent_aoa?: number | null
          start_date: string
          status?: string
          survival_rate?: number | null
          target_area_ha: number
          target_end_date?: string | null
          target_seedlings: number
          target_species?: string[] | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          area_polygon?: Json | null
          budget_aoa?: number | null
          code?: string
          coordinator_name?: string | null
          coordinator_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          implementing_entity?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality_id?: string | null
          name?: string
          objectives?: string | null
          photos?: Json | null
          planted_area_ha?: number | null
          planted_seedlings?: number | null
          program_type?: string
          province_id?: string | null
          spent_aoa?: number | null
          start_date?: string
          status?: string
          survival_rate?: number | null
          target_area_ha?: number
          target_end_date?: string | null
          target_seedlings?: number
          target_species?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forest_reforestation_programs_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_reforestation_programs_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_seedling_stock: {
        Row: {
          age_months: number | null
          cost_per_unit_aoa: number | null
          created_at: string
          expected_ready_date: string | null
          height_cm_avg: number | null
          id: string
          notes: string | null
          nursery_id: string
          production_date: string | null
          quantity: number
          ready_for_planting: boolean | null
          species: string
          updated_at: string
          variety: string | null
          wood_class: Database["public"]["Enums"]["wood_classification"] | null
        }
        Insert: {
          age_months?: number | null
          cost_per_unit_aoa?: number | null
          created_at?: string
          expected_ready_date?: string | null
          height_cm_avg?: number | null
          id?: string
          notes?: string | null
          nursery_id: string
          production_date?: string | null
          quantity: number
          ready_for_planting?: boolean | null
          species: string
          updated_at?: string
          variety?: string | null
          wood_class?: Database["public"]["Enums"]["wood_classification"] | null
        }
        Update: {
          age_months?: number | null
          cost_per_unit_aoa?: number | null
          created_at?: string
          expected_ready_date?: string | null
          height_cm_avg?: number | null
          id?: string
          notes?: string | null
          nursery_id?: string
          production_date?: string | null
          quantity?: number
          ready_for_planting?: boolean | null
          species?: string
          updated_at?: string
          variety?: string | null
          wood_class?: Database["public"]["Enums"]["wood_classification"] | null
        }
        Relationships: [
          {
            foreignKeyName: "forest_seedling_stock_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "forest_nurseries"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_transport_permits: {
        Row: {
          arrival_at: string | null
          checkpoints_passed: Json | null
          created_at: string
          created_by: string | null
          departure_at: string | null
          destination_latitude: number | null
          destination_location: string
          destination_longitude: number | null
          destination_province_id: string | null
          driver_document: string | null
          driver_name: string
          driver_phone: string | null
          id: string
          issue_date: string
          license_id: string
          log_ids: string[] | null
          notes: string | null
          operator_id: string
          origin_latitude: number | null
          origin_location: string
          origin_longitude: number | null
          origin_province_id: string | null
          permit_number: string
          qr_code_data: string | null
          species_summary: Json | null
          status: string
          total_logs: number | null
          total_volume_m3: number | null
          updated_at: string
          valid_until: string
          vehicle_plate: string
        }
        Insert: {
          arrival_at?: string | null
          checkpoints_passed?: Json | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          destination_latitude?: number | null
          destination_location: string
          destination_longitude?: number | null
          destination_province_id?: string | null
          driver_document?: string | null
          driver_name: string
          driver_phone?: string | null
          id?: string
          issue_date: string
          license_id: string
          log_ids?: string[] | null
          notes?: string | null
          operator_id: string
          origin_latitude?: number | null
          origin_location: string
          origin_longitude?: number | null
          origin_province_id?: string | null
          permit_number: string
          qr_code_data?: string | null
          species_summary?: Json | null
          status?: string
          total_logs?: number | null
          total_volume_m3?: number | null
          updated_at?: string
          valid_until: string
          vehicle_plate: string
        }
        Update: {
          arrival_at?: string | null
          checkpoints_passed?: Json | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          destination_latitude?: number | null
          destination_location?: string
          destination_longitude?: number | null
          destination_province_id?: string | null
          driver_document?: string | null
          driver_name?: string
          driver_phone?: string | null
          id?: string
          issue_date?: string
          license_id?: string
          log_ids?: string[] | null
          notes?: string | null
          operator_id?: string
          origin_latitude?: number | null
          origin_location?: string
          origin_longitude?: number | null
          origin_province_id?: string | null
          permit_number?: string
          qr_code_data?: string | null
          species_summary?: Json | null
          status?: string
          total_logs?: number | null
          total_volume_m3?: number | null
          updated_at?: string
          valid_until?: string
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "forest_transport_permits_destination_province_id_fkey"
            columns: ["destination_province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_transport_permits_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "forest_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_transport_permits_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "forest_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forest_transport_permits_origin_province_id_fkey"
            columns: ["origin_province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      forest_trees: {
        Row: {
          actual_volume_m3: number | null
          created_at: string
          diameter_cm: number | null
          estimated_volume_m3: number | null
          felled_at: string | null
          felled_by: string | null
          health_status: string | null
          height_m: number | null
          id: string
          latitude: number
          license_id: string
          longitude: number
          marked_at: string | null
          marked_by: string | null
          notes: string | null
          photos: Json | null
          plot_number: string | null
          species: string
          status: Database["public"]["Enums"]["tracking_status"]
          tree_code: string
          updated_at: string
          wood_class: Database["public"]["Enums"]["wood_classification"]
        }
        Insert: {
          actual_volume_m3?: number | null
          created_at?: string
          diameter_cm?: number | null
          estimated_volume_m3?: number | null
          felled_at?: string | null
          felled_by?: string | null
          health_status?: string | null
          height_m?: number | null
          id?: string
          latitude: number
          license_id: string
          longitude: number
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          photos?: Json | null
          plot_number?: string | null
          species: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tree_code: string
          updated_at?: string
          wood_class: Database["public"]["Enums"]["wood_classification"]
        }
        Update: {
          actual_volume_m3?: number | null
          created_at?: string
          diameter_cm?: number | null
          estimated_volume_m3?: number | null
          felled_at?: string | null
          felled_by?: string | null
          health_status?: string | null
          height_m?: number | null
          id?: string
          latitude?: number
          license_id?: string
          longitude?: number
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          photos?: Json | null
          plot_number?: string | null
          species?: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tree_code?: string
          updated_at?: string
          wood_class?: Database["public"]["Enums"]["wood_classification"]
        }
        Relationships: [
          {
            foreignKeyName: "forest_trees_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "forest_licenses"
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
      occurrence_alerts: {
        Row: {
          alert_type: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          occurrence_id: string
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          occurrence_id: string
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          occurrence_id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_alerts_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "climate_occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_surveys: {
        Row: {
          completed_at: string | null
          created_at: string
          farmer_id: string | null
          id: string
          occurrence_id: string | null
          province_id: string | null
          questions: Json
          responses: Json | null
          sent_at: string | null
          status: string
          survey_type: string
          target_phone: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          farmer_id?: string | null
          id?: string
          occurrence_id?: string | null
          province_id?: string | null
          questions: Json
          responses?: Json | null
          sent_at?: string | null
          status?: string
          survey_type: string
          target_phone: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          farmer_id?: string | null
          id?: string
          occurrence_id?: string | null
          province_id?: string | null
          questions?: Json
          responses?: Json | null
          sent_at?: string | null
          status?: string
          survey_type?: string
          target_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_surveys_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_surveys_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "climate_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_surveys_province_id_fkey"
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
      province_risk_metrics: {
        Row: {
          critical_occurrences: number | null
          high_occurrences: number | null
          id: string
          low_occurrences: number | null
          medium_occurrences: number | null
          month: number
          province_id: string
          risk_score: number | null
          total_affected_area_ha: number | null
          total_affected_farmers: number | null
          total_estimated_loss_aoa: number | null
          total_occurrences: number | null
          updated_at: string
          year: number
        }
        Insert: {
          critical_occurrences?: number | null
          high_occurrences?: number | null
          id?: string
          low_occurrences?: number | null
          medium_occurrences?: number | null
          month: number
          province_id: string
          risk_score?: number | null
          total_affected_area_ha?: number | null
          total_affected_farmers?: number | null
          total_estimated_loss_aoa?: number | null
          total_occurrences?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          critical_occurrences?: number | null
          high_occurrences?: number | null
          id?: string
          low_occurrences?: number | null
          medium_occurrences?: number | null
          month?: number
          province_id?: string
          risk_score?: number | null
          total_affected_area_ha?: number | null
          total_affected_farmers?: number | null
          total_estimated_loss_aoa?: number | null
          total_occurrences?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "province_risk_metrics_province_id_fkey"
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
      calculate_risk_score: {
        Args: {
          p_affected_area: number
          p_affected_farmers: number
          p_critical: number
          p_high: number
          p_low: number
          p_medium: number
        }
        Returns: number
      }
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
      forest_license_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "active"
        | "suspended"
        | "expired"
        | "revoked"
        | "rejected"
      forest_license_type:
        | "exploitation"
        | "transport"
        | "export"
        | "sawmill"
        | "processing"
      infraction_status:
        | "reported"
        | "investigating"
        | "confirmed"
        | "contested"
        | "sanctioned"
        | "appealed"
        | "closed"
        | "archived"
      infraction_type:
        | "illegal_cutting"
        | "transport_without_license"
        | "exceeded_quota"
        | "protected_species"
        | "false_declaration"
        | "document_forgery"
        | "unauthorized_area"
        | "environmental_damage"
        | "other"
      tracking_status:
        | "at_origin"
        | "felled"
        | "logged"
        | "in_transport"
        | "at_checkpoint"
        | "at_sawmill"
        | "processed"
        | "in_storage"
        | "exported"
        | "at_destination"
      user_role:
        | "admin_national"
        | "admin_provincial"
        | "admin_municipal"
        | "technician_national"
        | "technician_provincial"
        | "technician_municipal"
        | "private_entity"
        | "viewer"
      wood_classification:
        | "precious"
        | "first_class"
        | "second_class"
        | "common"
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
      forest_license_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "active",
        "suspended",
        "expired",
        "revoked",
        "rejected",
      ],
      forest_license_type: [
        "exploitation",
        "transport",
        "export",
        "sawmill",
        "processing",
      ],
      infraction_status: [
        "reported",
        "investigating",
        "confirmed",
        "contested",
        "sanctioned",
        "appealed",
        "closed",
        "archived",
      ],
      infraction_type: [
        "illegal_cutting",
        "transport_without_license",
        "exceeded_quota",
        "protected_species",
        "false_declaration",
        "document_forgery",
        "unauthorized_area",
        "environmental_damage",
        "other",
      ],
      tracking_status: [
        "at_origin",
        "felled",
        "logged",
        "in_transport",
        "at_checkpoint",
        "at_sawmill",
        "processed",
        "in_storage",
        "exported",
        "at_destination",
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
      wood_classification: [
        "precious",
        "first_class",
        "second_class",
        "common",
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
