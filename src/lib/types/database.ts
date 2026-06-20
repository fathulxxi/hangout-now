export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          token?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          token?: string;
          created_at?: string;
        };
      };
      availability: {
        Row: {
          id: string;
          member_id: string;
          free_until: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          free_until: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          free_until?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
