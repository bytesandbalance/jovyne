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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      helper_invoices: {
        Row: {
          amount: number | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          event_date: string | null
          event_id: string | null
          helper_application_id: string | null
          helper_id: string
          helper_name: string | null
          helper_request_id: string | null
          hourly_rate: number | null
          id: string
          job_title: string
          line_items: Json
          notes: string | null
          paid_at: string | null
          planner_contact_email: string | null
          planner_contact_phone: string | null
          planner_id: string
          planner_name: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          event_date?: string | null
          event_id?: string | null
          helper_application_id?: string | null
          helper_id: string
          helper_name?: string | null
          helper_request_id?: string | null
          hourly_rate?: number | null
          id?: string
          job_title: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          planner_contact_email?: string | null
          planner_contact_phone?: string | null
          planner_id: string
          planner_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          event_date?: string | null
          event_id?: string | null
          helper_application_id?: string | null
          helper_id?: string
          helper_name?: string | null
          helper_request_id?: string | null
          hourly_rate?: number | null
          id?: string
          job_title?: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          planner_contact_email?: string | null
          planner_contact_phone?: string | null
          planner_id?: string
          planner_name?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["helper_invoice_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_requests: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          event_id: string | null
          hourly_rate: number | null
          id: string
          location_city: string
          planner_id: string | null
          required_skills: string[] | null
          start_time: string | null
          status: Database["public"]["Enums"]["helper_request_status"] | null
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          end_time?: string | null
          event_date: string
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          location_city: string
          planner_id?: string | null
          required_skills?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["helper_request_status"] | null
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          location_city?: string
          planner_id?: string | null
          required_skills?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["helper_request_status"] | null
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_requests_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          helper_id: string
          id: string
          is_completed: boolean
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          helper_id: string
          id?: string
          is_completed?: boolean
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          helper_id?: string
          id?: string
          is_completed?: boolean
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      helpers: {
        Row: {
          availability_cities: string[] | null
          average_rating: number | null
          bio: string | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          portfolio_images: string[] | null
          skills: string[] | null
          total_jobs: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_cities?: string[] | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          portfolio_images?: string[] | null
          skills?: string[] | null
          total_jobs?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_cities?: string[] | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          portfolio_images?: string[] | null
          skills?: string[] | null
          total_jobs?: number | null
          updated_at?: string
          user_id?: string
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
      planner_invoices: {
        Row: {
          amount: number | null
          client_contact_email: string | null
          client_contact_phone: string | null
          client_id: string
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
          client_id: string
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
          client_id?: string
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
        ]
      }
      planners: {
        Row: {
          average_rating: number | null
          base_price: number | null
          business_name: string
          created_at: string
          description: string | null
          id: string
          instagram_handle: string | null
          is_verified: boolean | null
          latitude: number | null
          location_city: string | null
          location_state: string | null
          longitude: number | null
          portfolio_images: string[] | null
          services: string[] | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          base_price?: number | null
          business_name: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          base_price?: number | null
          business_name?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          portfolio_images?: string[] | null
          services?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
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
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      helper_request_status: "open" | "in_review" | "filled" | "cancelled"
      planner_request_status: "pending" | "approved" | "rejected"
      user_role: "client" | "planner" | "helper"
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
      ],
      helper_request_status: ["open", "in_review", "filled", "cancelled"],
      planner_request_status: ["pending", "approved", "rejected"],
      user_role: ["client", "planner", "helper"],
    },
  },
} as const
