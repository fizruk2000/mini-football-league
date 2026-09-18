export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
      };
    };
    Views: {
      standings: {
        Row: {
          team_id: string;
          team_name: string;
          season_id: string;
          played: number;
          won: number;
          drawn: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          goal_diff: number;
          points: number;
        };
      };
      top_scorers: {
        Row: {
          player_id: string;
          player_name: string;
          team_name: string;
          season_id: string;
          goals: number;
        };
      };
      top_assists: {
        Row: {
          player_id: string;
          player_name: string;
          team_name: string;
          season_id: string;
          assists: number;
        };
      };
      top_goalkeepers: {
        Row: {
          player_id: string;
          player_name: string;
          team_name: string;
          season_id: string;
          clean_sheets: number;
          saves: number;
        };
      };
    };
  };
}

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
