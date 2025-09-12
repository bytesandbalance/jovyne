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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      client_budget_categories: {
        Row: {
          allocated_amount: number
          client_id: string
          created_at: string
          id: string
          name: string
          spent_amount: number
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          client_id: string
          created_at?: string
          id?: string
          name: string
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          spent_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_budget_categories_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_budget_expenses: {
        Row: {
          amount: number
          category_id: string
          client_id: string
          created_at: string
          description: string
          expense_date: string
          id: string
          receipt_url: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category_id: string
          client_id: string
          created_at?: string
          description: string
          expense_date: string
          id?: string
          receipt_url?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          client_id?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_budget_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "client_budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_budget_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tasks: {
        Row: {
          category: string
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          planner_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          planner_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          planner_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          guest_count: number | null
          id: string
          planner_id: string
          status: string
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          guest_count?: number | null
          id?: string
          planner_id: string
          status?: string
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          guest_count?: number | null
          id?: string
          planner_id?: string
          status?: string
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      planner_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          estimated_hours: number | null
          id: string
          planner_id: string
          planner_request_id: string
          proposed_fee: number | null
          status: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          estimated_hours?: number | null
          id?: string
          planner_id: string
          planner_request_id: string
          proposed_fee?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          estimated_hours?: number | null
          id?: string
          planner_id?: string
          planner_request_id?: string
          proposed_fee?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_applications_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_applications_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_applications_planner_request_id_fkey"
            columns: ["planner_request_id"]
            isOneToOne: false
            referencedRelation: "planner_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_calendar: {
        Row: {
          created_at: string | null
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          is_available: boolean | null
          location: string | null
          planner_id: string
          start_datetime: string
          title: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_datetime: string
          event_type: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          planner_id: string
          start_datetime: string
          title: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          planner_id?: string
          start_datetime?: string
          title?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_calendar_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_calendar_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_calendar_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "planner_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_inventory: {
        Row: {
          category: string
          condition: string
          created_at: string | null
          current_value: number | null
          description: string | null
          id: string
          item_name: string
          last_maintenance_date: string | null
          location: string | null
          maintenance_notes: string | null
          next_maintenance_date: string | null
          planner_id: string
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          item_name: string
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_notes?: string | null
          next_maintenance_date?: string | null
          planner_id: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          item_name?: string
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_notes?: string | null
          next_maintenance_date?: string | null
          planner_id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_inventory_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_inventory_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_invoices: {
        Row: {
          amount: number | null
          client_contact_email: string | null
          client_contact_phone: string | null
          client_id: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string
          event_date: string | null
          event_id: string | null
          id: string
          job_title: string
          line_items: Json
          notes: string | null
          paid_at: string | null
          planner_application_id: string | null
          planner_id: string
          planner_name: string | null
          planner_request_id: string | null
          proposed_fee: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_contact_email?: string | null
          client_contact_phone?: string | null
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          event_date?: string | null
          event_id?: string | null
          id?: string
          job_title: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          planner_application_id?: string | null
          planner_id: string
          planner_name?: string | null
          planner_request_id?: string | null
          proposed_fee?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_contact_email?: string | null
          client_contact_phone?: string | null
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          event_date?: string | null
          event_id?: string | null
          id?: string
          job_title?: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          planner_application_id?: string | null
          planner_id?: string
          planner_name?: string | null
          planner_request_id?: string | null
          proposed_fee?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_invoices_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_invoices_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_invoices_planner_request_id_fkey"
            columns: ["planner_request_id"]
            isOneToOne: false
            referencedRelation: "planner_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_requests: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          event_id: string | null
          id: string
          location_city: string
          planner_id: string | null
          required_services: string[] | null
          start_time: string | null
          status: Database["public"]["Enums"]["planner_request_status"] | null
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          description: string
          end_time?: string | null
          event_date: string
          event_id?: string | null
          id?: string
          location_city: string
          planner_id?: string | null
          required_services?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["planner_request_status"] | null
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          event_id?: string | null
          id?: string
          location_city?: string
          planner_id?: string | null
          required_services?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["planner_request_status"] | null
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_requests_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_requests_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          planner_id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          planner_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          planner_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_tasks_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_tasks_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_templates: {
        Row: {
          content: Json
          created_at: string | null
          description: string | null
          estimated_budget: number | null
          estimated_hours: number | null
          event_type: string | null
          id: string
          name: string
          planner_id: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          description?: string | null
          estimated_budget?: number | null
          estimated_hours?: number | null
          event_type?: string | null
          id?: string
          name: string
          planner_id: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string | null
          estimated_budget?: number | null
          estimated_hours?: number | null
          event_type?: string | null
          id?: string
          name?: string
          planner_id?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_templates_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_templates_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_vendors: {
        Row: {
          address: string | null
          availability_notes: string | null
          business_type: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          planner_id: string
          pricing_info: string | null
          rating: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          availability_notes?: string | null
          business_type: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          planner_id: string
          pricing_info?: string | null
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          availability_notes?: string | null
          business_type?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          planner_id?: string
          pricing_info?: string | null
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_vendors_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_vendors_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      planners: {
        Row: {
          average_rating: number | null
          base_price: number | null
          business_name: string
          created_at: string
          description: string | null
          email: string | null
          free_trial_started_at: string | null
          id: string
          instagram_handle: string | null
          is_verified: boolean | null
          latitude: number | null
          location_city: string | null
          location_state: string | null
          longitude: number | null
          paypal_subscription_id: string | null
          portfolio_images: string[] | null
          services: string[] | null
          specialties: string[] | null
          subscription_expires_at: string | null
          subscription_status: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          base_price?: number | null
          business_name: string
          created_at?: string
          description?: string | null
          email?: string | null
          free_trial_started_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          paypal_subscription_id?: string | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          base_price?: number | null
          business_name?: string
          created_at?: string
          description?: string | null
          email?: string | null
          free_trial_started_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          paypal_subscription_id?: string | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          event_id: string | null
          id: string
          planner_id: string
          rating: number
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          planner_id: string
          rating: number
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          planner_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      planners_public: {
        Row: {
          average_rating: number | null
          base_price: number | null
          business_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          instagram_handle: string | null
          is_verified: boolean | null
          location_city: string | null
          location_state: string | null
          portfolio_images: string[] | null
          services: string[] | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          base_price?: number | null
          business_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          instagram_handle?: string | null
          is_verified?: boolean | null
          location_city?: string | null
          location_state?: string | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          base_price?: number | null
          business_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          instagram_handle?: string | null
          is_verified?: boolean | null
          location_city?: string | null
          location_state?: string | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_profiles: {
        Args: { user_ids?: string[] }
        Returns: {
          avatar_url: string
          full_name: string
          user_id: string
        }[]
      }
      is_sensitive_planner_field: {
        Args: { field_name: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      event_status:
        | "planning"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      helper_invoice_status:
        | "draft"
        | "sent_to_planner"
        | "awaiting_payment"
        | "paid_planner"
        | "completed"
        | "paid_external"
      planner_request_status: "pending" | "approved" | "rejected"
      user_role: "client" | "planner"
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
      application_status: ["pending", "approved", "rejected"],
      event_status: [
        "planning",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      helper_invoice_status: [
        "draft",
        "sent_to_planner",
        "awaiting_payment",
        "paid_planner",
        "completed",
        "paid_external",
      ],
      planner_request_status: ["pending", "approved", "rejected"],
      user_role: ["client", "planner"],
    },
  },
} as const
