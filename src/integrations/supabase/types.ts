export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      artist_bookings: {
        Row: {
          artist_id: string
          budget_max: number | null
          budget_min: number | null
          contact_info: string
          created_at: string
          event_date: string
          event_description: string
          event_location: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id: string
          budget_max?: number | null
          budget_min?: number | null
          contact_info: string
          created_at?: string
          event_date: string
          event_description: string
          event_location: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          budget_max?: number | null
          budget_min?: number | null
          contact_info?: string
          created_at?: string
          event_date?: string
          event_description?: string
          event_location?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string
          experience_years: number | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          is_available: boolean | null
          portfolio_urls: string[] | null
          specialty: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          is_available?: boolean | null
          portfolio_urls?: string[] | null
          specialty?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          is_available?: boolean | null
          portfolio_urls?: string[] | null
          specialty?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          contact_info: string | null
          content: string
          created_at: string
          event_date: string | null
          event_location: string | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          likes_count: number | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          longitude: number | null
          price_range: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          title: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          contact_info?: string | null
          content: string
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          likes_count?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          price_range?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          contact_info?: string | null
          content?: string
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          likes_count?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          price_range?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          longitude: number | null
          updated_at: string
          user_id: string
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      artist_bookings_safe: {
        Row: {
          artist_id: string | null
          budget_max: number | null
          budget_min: number | null
          contact_info: string | null
          created_at: string | null
          event_date: string | null
          event_description: string | null
          event_location: string | null
          id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          artist_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_info?: string | null
          created_at?: string | null
          event_date?: string | null
          event_description?: string | null
          event_location?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          artist_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_info?: string | null
          created_at?: string | null
          event_date?: string | null
          event_description?: string | null
          event_location?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      can_view_booking_details: {
        Args: { _booking_id: string; _user_id: string }
        Returns: boolean
      }
      get_artist_bookings_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          artist_id: string
          event_date: string
          event_location: string
          event_description: string
          budget_min: number
          budget_max: number
          contact_info: string
          status: string
          created_at: string
          updated_at: string
        }[]
      }
      get_posts_with_restricted_contact: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["post_type"]
          title: string
          content: string
          location_city: string
          location_state: string
          location_country: string
          latitude: number
          longitude: number
          event_date: string
          event_location: string
          price_range: string
          contact_info: string
          tags: string[]
          image_urls: string[]
          likes_count: number
          comments_count: number
          status: Database["public"]["Enums"]["post_status"]
          created_at: string
          updated_at: string
        }[]
      }
      users_in_same_area: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
    }
    Enums: {
      post_status: "active" | "inactive" | "completed"
      post_type: "post" | "event" | "service" | "discussion"
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
      post_status: ["active", "inactive", "completed"],
      post_type: ["post", "event", "service", "discussion"],
    },
  },
} as const
