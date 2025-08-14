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
          planner_id: string
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
          planner_id: string
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
          planner_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      communication_requests: {
        Row: {
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          hourly_rate: number | null
          id: string
          location_city: string
          message: string | null
          recipient_id: string
          recipient_type: string
          required_skills: string[] | null
          responded_at: string | null
          response_message: string | null
          sender_id: string
          sender_type: string
          start_time: string | null
          status: string
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_time?: string | null
          event_date: string
          hourly_rate?: number | null
          id?: string
          location_city: string
          message?: string | null
          recipient_id: string
          recipient_type: string
          required_skills?: string[] | null
          responded_at?: string | null
          response_message?: string | null
          sender_id: string
          sender_type: string
          start_time?: string | null
          status?: string
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          hourly_rate?: number | null
          id?: string
          location_city?: string
          message?: string | null
          recipient_id?: string
          recipient_type?: string
          required_skills?: string[] | null
          responded_at?: string | null
          response_message?: string | null
          sender_id?: string
          sender_type?: string
          start_time?: string | null
          status?: string
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      event_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          event_id: string
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          notes: string | null
          planner_id: string
          status: Database["public"]["Enums"]["event_status"] | null
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
          notes?: string | null
          planner_id: string
          status?: Database["public"]["Enums"]["event_status"] | null
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
          notes?: string | null
          planner_id?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_applications: {
        Row: {
          applied_at: string
          helper_id: string
          helper_request_id: string
          hourly_rate: number | null
          id: string
          message: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"] | null
        }
        Insert: {
          applied_at?: string
          helper_id: string
          helper_request_id: string
          hourly_rate?: number | null
          id?: string
          message?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Update: {
          applied_at?: string
          helper_id?: string
          helper_request_id?: string
          hourly_rate?: number | null
          id?: string
          message?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "helper_applications_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helpers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_applications_helper_request_id_fkey"
            columns: ["helper_request_id"]
            isOneToOne: false
            referencedRelation: "helper_approved_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_applications_helper_request_id_fkey"
            columns: ["helper_request_id"]
            isOneToOne: false
            referencedRelation: "helper_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_invoices: {
        Row: {
          amount: number | null
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
        Relationships: []
      }
      helper_requests: {
        Row: {
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          event_id: string | null
          hourly_rate: number | null
          id: string
          location_city: string
          planner_id: string
          required_skills: string[] | null
          start_time: string | null
          status: Database["public"]["Enums"]["helper_request_status"] | null
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_time?: string | null
          event_date: string
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          location_city: string
          planner_id: string
          required_skills?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["helper_request_status"] | null
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          location_city?: string
          planner_id?: string
          required_skills?: string[] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["helper_request_status"] | null
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          invoice_number: string
          issued_date: string | null
          line_items: Json | null
          planner_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          line_items?: Json | null
          planner_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          line_items?: Json | null
          planner_id?: string
          status?: string | null
          updated_at?: string
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
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
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
      helper_approved_jobs: {
        Row: {
          application_message: string | null
          applied_at: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string | null
          event_id: string | null
          hourly_rate: number | null
          id: string | null
          location_city: string | null
          planner_business_name: string | null
          planner_id: string | null
          planner_name: string | null
          required_skills: string[] | null
          reviewed_at: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["helper_request_status"] | null
          title: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helper_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      user_role: ["client", "planner", "helper"],
    },
  },
} as const
