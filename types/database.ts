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
          full_name: string | null;
          role: 'admin' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          year: number;
          system: 'round_robin' | 'groups' | 'playoff' | 'swiss';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          system?: 'round_robin' | 'groups' | 'playoff' | 'swiss';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          system?: 'round_robin' | 'groups' | 'playoff' | 'swiss';
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          season_id: string;
          name: string;
          short_name: string;
          emblem_url: string | null;
          color_primary: string;
          color_secondary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          name: string;
          short_name: string;
          emblem_url?: string | null;
          color_primary?: string;
          color_secondary?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          name?: string;
          short_name?: string;
          emblem_url?: string | null;
          color_primary?: string;
          color_secondary?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'seasons';
            referencedColumns: ['id'];
          }
        ];
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          first_name: string;
          last_name: string;
          number: number | null;
          position: 'GK' | 'DEF' | 'MID' | 'FWD';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          first_name: string;
          last_name: string;
          number?: number | null;
          position?: 'GK' | 'DEF' | 'MID' | 'FWD';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          first_name?: string;
          last_name?: string;
          number?: number | null;
          position?: 'GK' | 'DEF' | 'MID' | 'FWD';
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'players_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
      rounds: {
        Row: {
          id: string;
          season_id: string;
          number: number;
          name: string;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          number: number;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          number?: number;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rounds_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'seasons';
            referencedColumns: ['id'];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          season_id: string;
          round_id: string | null;
          home_team_id: string;
          away_team_id: string;
          home_score: number | null;
          away_score: number | null;
          match_date: string | null;
          match_time: string | null;
          status: 'scheduled' | 'live' | 'finished' | 'cancelled';
          venue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          round_id?: string | null;
          home_team_id: string;
          away_team_id: string;
          home_score?: number | null;
          away_score?: number | null;
          match_date?: string | null;
          match_time?: string | null;
          status?: 'scheduled' | 'live' | 'finished' | 'cancelled';
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          round_id?: string | null;
          home_team_id?: string;
          away_team_id?: string;
          home_score?: number | null;
          away_score?: number | null;
          match_date?: string | null;
          match_time?: string | null;
          status?: 'scheduled' | 'live' | 'finished' | 'cancelled';
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'seasons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_round_id_fkey';
            columns: ['round_id'];
            isOneToOne: false;
            referencedRelation: 'rounds';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_home_team_id_fkey';
            columns: ['home_team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_away_team_id_fkey';
            columns: ['away_team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
      match_events: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          team_id: string;
          event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'save';
          minute: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          team_id: string;
          event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'save';
          minute?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          team_id?: string;
          event_type?: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'own_goal' | 'save';
          minute?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'match_events_match_id_fkey';
            columns: ['match_id'];
            isOneToOne: false;
            referencedRelation: 'matches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'match_events_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'match_events_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      standings: {
        Row: {
          team_id: string | null;
          team_name: string | null;
          season_id: string | null;
          played: number | null;
          won: number | null;
          drawn: number | null;
          lost: number | null;
          goals_for: number | null;
          goals_against: number | null;
          goal_diff: number | null;
          points: number | null;
        };
        Relationships: [];
      };
      top_scorers: {
        Row: {
          player_id: string | null;
          player_name: string | null;
          team_name: string | null;
          season_id: string | null;
          goals: number | null;
        };
        Relationships: [];
      };
      top_assists: {
        Row: {
          player_id: string | null;
          player_name: string | null;
          team_name: string | null;
          season_id: string | null;
          assists: number | null;
        };
        Relationships: [];
      };
      top_goalkeepers: {
        Row: {
          player_id: string | null;
          player_name: string | null;
          team_name: string | null;
          season_id: string | null;
          clean_sheets: number | null;
          saves: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Удобные алиасы
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Season = Database['public']['Tables']['seasons']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type Player = Database['public']['Tables']['players']['Row'];
export type Round = Database['public']['Tables']['rounds']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchEvent = Database['public']['Tables']['match_events']['Row'];
export type Standing = Database['public']['Views']['standings']['Row'];
export type TopScorer = Database['public']['Views']['top_scorers']['Row'];
export type TopAssist = Database['public']['Views']['top_assists']['Row'];
export type TopGoalkeeper = Database['public']['Views']['top_goalkeepers']['Row'];
