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
        Relationships: [
          {
            foreignKeyName: 'members_group_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['group_id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'availability_member_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'availability';
            referencedColumns: ['member_id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'availability_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
