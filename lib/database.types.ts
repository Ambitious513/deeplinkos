export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          workspace_name: string | null;
          onboarding_completed_at: string | null;
          plan: string;
          polar_subscription_id: string | null;
          polar_customer_id: string | null;
          polar_current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          workspace_name?: string | null;
          onboarding_completed_at?: string | null;
          plan?: string;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          polar_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          workspace_name?: string | null;
          onboarding_completed_at?: string | null;
          plan?: string;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          polar_current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      domains: {
        Row: {
          id: string;
          user_id: string;
          domain_name: string;
          status: "pending" | "active" | "failed" | "disabled";
          verification_token: string;
          cname_target: string | null;
          verified_at: string | null;
          last_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain_name: string;
          status?: "pending" | "active" | "failed" | "disabled";
          verification_token?: string;
          cname_target?: string | null;
          verified_at?: string | null;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["domains"]["Insert"]>;
        Relationships: [];
      };
      deep_links: {
        Row: {
          id: string;
          user_id: string;
          domain_id: string | null;
          slug: string;
          title: string;
          description: string | null;
          preset: string;
          status: "active" | "paused" | "archived" | "locked";
          is_active: boolean;
          destination_url: string | null;
          ios_deep_link: string | null;
          ios_store_url: string | null;
          android_deep_link: string | null;
          android_store_url: string | null;
          desktop_url: string | null;
          fallback_url: string | null;
          password_hash: string | null;
          expires_at: string | null;
          ab_test_url: string | null;
          ab_test_weight: number;
          campaign: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          routing_config: Json;
          metadata: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain_id?: string | null;
          slug: string;
          title: string;
          description?: string | null;
          preset?: string;
          status?: "active" | "paused" | "archived" | "locked";
          is_active?: boolean;
          destination_url?: string | null;
          ios_deep_link?: string | null;
          ios_store_url?: string | null;
          android_deep_link?: string | null;
          android_store_url?: string | null;
          desktop_url?: string | null;
          fallback_url?: string | null;
          password_hash?: string | null;
          expires_at?: string | null;
          ab_test_url?: string | null;
          ab_test_weight?: number;
          campaign?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          routing_config?: Json;
          metadata?: Json;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deep_links"]["Insert"]>;
        Relationships: [];
      };
      clicks: {
        Row: {
          id: string;
          link_id: string;
          clicked_at: string;
          dedupe_bucket: string;
          variant: "a" | "b" | null;
          device: string | null;
          os: string | null;
          browser: string | null;
          referrer: string | null;
          country: string | null;
          city: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          ip_hash: string | null;
          user_agent_hash: string | null;
          is_bot: boolean;
          is_prefetch: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          link_id: string;
          clicked_at?: string;
          dedupe_bucket?: string;
          variant?: "a" | "b" | null;
          device?: string | null;
          os?: string | null;
          browser?: string | null;
          referrer?: string | null;
          country?: string | null;
          city?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          is_bot?: boolean;
          is_prefetch?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clicks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_analytics: {
        Args: { user_uuid: string; days_ago?: number };
        Returns: {
          total_clicks: number;
          unique_visitors: number;
          active_links: number;
          paused_links: number;
          top_referrer: string | null;
        }[];
      };
      get_clicks_by_day: {
        Args: { user_uuid: string; days_ago?: number };
        Returns: {
          click_date: string;
          click_count: number;
          unique_visitors: number;
        }[];
      };
      get_global_analytics: {
        Args: { user_uuid: string };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
