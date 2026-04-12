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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          attachments: Json | null
          author_id: string | null
          category: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          category?: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      introduction_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          introduction_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          introduction_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          introduction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introduction_comments_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      introduction_likes: {
        Row: {
          created_at: string
          id: string
          introduction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          introduction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          introduction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introduction_likes_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      introductions: {
        Row: {
          age: string | null
          blood_type: string | null
          created_at: string
          current_city: string | null
          department: string | null
          drinking_smoking: string | null
          hobby: string | null
          hometown: string | null
          id: string
          join_date: string | null
          mbti: string | null
          name: string
          personality_cons: string | null
          personality_pros: string | null
          photo_url: string | null
          playlist: string | null
          position: string | null
          promise_to_team: string | null
          recent_happy: string | null
          recent_sad: string | null
          sub_photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: string | null
          blood_type?: string | null
          created_at?: string
          current_city?: string | null
          department?: string | null
          drinking_smoking?: string | null
          hobby?: string | null
          hometown?: string | null
          id?: string
          join_date?: string | null
          mbti?: string | null
          name: string
          personality_cons?: string | null
          personality_pros?: string | null
          photo_url?: string | null
          playlist?: string | null
          position?: string | null
          promise_to_team?: string | null
          recent_happy?: string | null
          recent_sad?: string | null
          sub_photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: string | null
          blood_type?: string | null
          created_at?: string
          current_city?: string | null
          department?: string | null
          drinking_smoking?: string | null
          hobby?: string | null
          hometown?: string | null
          id?: string
          join_date?: string | null
          mbti?: string | null
          name?: string
          personality_cons?: string | null
          personality_pros?: string | null
          photo_url?: string | null
          playlist?: string | null
          position?: string | null
          promise_to_team?: string | null
          recent_happy?: string | null
          recent_sad?: string | null
          sub_photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          age: string | null
          attendance: string | null
          batch: number | null
          category: string | null
          company: string | null
          created_at: string
          department: string | null
          employee_id: string | null
          gender: string | null
          id: string
          name: string
          notes: string | null
          passport_submitted: string | null
          phone: string | null
          position: string | null
          room_assignment: string | null
          status: string | null
          team: string | null
          updated_at: string
          user_id: string | null
          work_area: string | null
        }
        Insert: {
          age?: string | null
          attendance?: string | null
          batch?: number | null
          category?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          gender?: string | null
          id?: string
          name: string
          notes?: string | null
          passport_submitted?: string | null
          phone?: string | null
          position?: string | null
          room_assignment?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string
          user_id?: string | null
          work_area?: string | null
        }
        Update: {
          age?: string | null
          attendance?: string | null
          batch?: number | null
          category?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          gender?: string | null
          id?: string
          name?: string
          notes?: string | null
          passport_submitted?: string | null
          phone?: string | null
          position?: string | null
          room_assignment?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string
          user_id?: string | null
          work_area?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_employee_id: {
        Args: {
          _employee_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
