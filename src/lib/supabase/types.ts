/**
 * Tipos do schema do Supabase para o APROVA.
 *
 * Estes tipos refletem manualmente as 7 tabelas principais (PRD seção 7),
 * as 2 tabelas auxiliares (subtopic_mastery, simulado_bonuses) e a view
 * weekly_leaderboard. Compatível com `@supabase/supabase-js` e
 * `@supabase/ssr`.
 *
 * Após criar o projeto Supabase real, regerar via:
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/types.generated.ts
 *
 * Mantenha este arquivo como referência canônica até a geração automática
 * estar disponível.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AttemptContext = 'quiz' | 'revisao' | 'simulado' | 'review' | 'diagnostic';
export type StudySessionType = 'quiz' | 'revisao' | 'simulado' | 'diagnostic';
export type Discipline = 'matematica' | 'fisica' | 'quimica' | 'biologia' | 'humanas' | 'linguagens';
export type AnswerLetter = 'A' | 'B' | 'C' | 'D' | 'E';
export type UserQuestionStatus = 'correct' | 'wrong' | 'toreview';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Plan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'inactive';
export type GameId =
  | 'mate_speed'
  | 'wordle'
  | 'memory_periodic'
  | 'snake_anatomy'
  | '2048'
  | 'trunfo'
  | 'corrida'
  | 'sudoku'
  | 'logica'
  | 'hanoi';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

export interface TheoryLink {
  title: string;
  url: string;
  source: string;
}

export interface DailyMission {
  id: string;
  label: string;
  goal: number;
  progress: number;
  completed: boolean;
  xp_reward: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          city: string | null;
          target_exam: string | null;
          daily_goal_questions: number | null;
          is_public_in_leaderboard: boolean | null;
          onboarding_completed: boolean;
          favorite_discipline: Discipline | null;
          account_status: 'pending' | 'approved' | 'blocked';
          is_admin: boolean;
          plan: Plan;
          plan_expires_at: string | null;
          questions_used_count: number;
          simulados_used_count: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          city?: string | null;
          target_exam?: string | null;
          daily_goal_questions?: number | null;
          is_public_in_leaderboard?: boolean | null;
          onboarding_completed?: boolean;
          favorite_discipline?: Discipline | null;
          account_status?: 'pending' | 'approved' | 'blocked';
          is_admin?: boolean;
          plan?: Plan;
          plan_expires_at?: string | null;
          questions_used_count?: number;
          simulados_used_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          city?: string | null;
          target_exam?: string | null;
          daily_goal_questions?: number | null;
          is_public_in_leaderboard?: boolean | null;
          onboarding_completed?: boolean;
          favorite_discipline?: Discipline | null;
          account_status?: 'pending' | 'approved' | 'blocked';
          is_admin?: boolean;
          plan?: Plan;
          plan_expires_at?: string | null;
          questions_used_count?: number;
          simulados_used_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          discipline: string;
          subtopic: string;
          subtopic_short: string;
          year: number;
          semester: number;
          question_num: number;
          description: string | null;
          image_url: string;
          correct_answer: AnswerLetter | null;
          annulled: boolean | null;
          exam: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          discipline: string;
          subtopic: string;
          subtopic_short: string;
          year: number;
          semester: number;
          question_num: number;
          description?: string | null;
          image_url: string;
          correct_answer?: AnswerLetter | null;
          annulled?: boolean | null;
          exam?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          discipline?: string;
          subtopic?: string;
          subtopic_short?: string;
          year?: number;
          semester?: number;
          question_num?: number;
          description?: string | null;
          image_url?: string;
          correct_answer?: AnswerLetter | null;
          annulled?: boolean | null;
          exam?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          type: StudySessionType;
          filters: Json | null;
          started_at: string | null;
          ended_at: string | null;
          total_questions: number | null;
          correct_count: number | null;
          duration_sec: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: StudySessionType;
          filters?: Json | null;
          started_at?: string | null;
          ended_at?: string | null;
          total_questions?: number | null;
          correct_count?: number | null;
          duration_sec?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: StudySessionType;
          filters?: Json | null;
          started_at?: string | null;
          ended_at?: string | null;
          total_questions?: number | null;
          correct_count?: number | null;
          duration_sec?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'study_sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      attempts: {
        Row: {
          id: number;
          user_id: string;
          question_id: string;
          answer: AnswerLetter | null;
          is_correct: boolean | null;
          time_spent_sec: number | null;
          context: AttemptContext;
          session_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: string;
          answer?: AnswerLetter | null;
          is_correct?: boolean | null;
          time_spent_sec?: number | null;
          context: AttemptContext;
          session_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          question_id?: string;
          answer?: AnswerLetter | null;
          is_correct?: boolean | null;
          time_spent_sec?: number | null;
          context?: AttemptContext;
          session_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'attempts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'attempts_question_id_fkey';
            columns: ['question_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'attempts_session_id_fkey';
            columns: ['session_id'];
            referencedRelation: 'study_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      weekly_xp: {
        Row: {
          user_id: string;
          week_start: string;
          xp: number | null;
          questions_answered: number | null;
        };
        Insert: {
          user_id: string;
          week_start: string;
          xp?: number | null;
          questions_answered?: number | null;
        };
        Update: {
          user_id?: string;
          week_start?: string;
          xp?: number | null;
          questions_answered?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'weekly_xp_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number | null;
          longest_streak: number | null;
          last_active_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          current_streak?: number | null;
          longest_streak?: number | null;
          last_active_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          current_streak?: number | null;
          longest_streak?: number | null;
          last_active_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'streaks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_question_status: {
        Row: {
          user_id: string;
          question_id: string;
          status: UserQuestionStatus;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          question_id: string;
          status: UserQuestionStatus;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          question_id?: string;
          status?: UserQuestionStatus;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_question_status_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_question_status_question_id_fkey';
            columns: ['question_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      subtopic_mastery: {
        Row: {
          user_id: string;
          discipline: string;
          subtopic: string;
          granted_at: string | null;
        };
        Insert: {
          user_id: string;
          discipline: string;
          subtopic: string;
          granted_at?: string | null;
        };
        Update: {
          user_id?: string;
          discipline?: string;
          subtopic?: string;
          granted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subtopic_mastery_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      simulado_bonuses: {
        Row: {
          session_id: string;
          user_id: string;
          xp_awarded: number;
          awarded_at: string | null;
        };
        Insert: {
          session_id: string;
          user_id: string;
          xp_awarded: number;
          awarded_at?: string | null;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          xp_awarded?: number;
          awarded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'simulado_bonuses_session_id_fkey';
            columns: ['session_id'];
            referencedRelation: 'study_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'simulado_bonuses_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      question_solutions: {
        Row: {
          question_id: string;
          content_md: string;
          conclusion: AnswerLetter;
          generated_by: string;
          reviewed: boolean;
          generated_at: string | null;
        };
        Insert: {
          question_id: string;
          content_md: string;
          conclusion: AnswerLetter;
          generated_by: string;
          reviewed?: boolean;
          generated_at?: string | null;
        };
        Update: {
          question_id?: string;
          content_md?: string;
          conclusion?: AnswerLetter;
          generated_by?: string;
          reviewed?: boolean;
          generated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'question_solutions_question_id_fkey';
            columns: ['question_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      subtopic_theory: {
        Row: {
          discipline: string;
          subtopic: string;
          summary_md: string;
          links: TheoryLink[];
          generated_at: string | null;
        };
        Insert: {
          discipline: string;
          subtopic: string;
          summary_md: string;
          links?: TheoryLink[];
          generated_at?: string | null;
        };
        Update: {
          discipline?: string;
          subtopic?: string;
          summary_md?: string;
          links?: TheoryLink[];
          generated_at?: string | null;
        };
        Relationships: [];
      };
      question_chats: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          messages: ChatMessage[];
          msg_count: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          messages?: ChatMessage[];
          msg_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          messages?: ChatMessage[];
          msg_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'question_chats_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_chats_question_id_fkey';
            columns: ['question_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_chat_usage: {
        Row: {
          user_id: string;
          day: string;
          msg_count: number;
        };
        Insert: {
          user_id: string;
          day: string;
          msg_count?: number;
        };
        Update: {
          user_id?: string;
          day?: string;
          msg_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_chat_usage_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      global_chat_usage: {
        Row: {
          day: string;
          msg_count: number;
          by_provider: Record<string, number>;
        };
        Insert: {
          day: string;
          msg_count?: number;
          by_provider?: Record<string, number>;
        };
        Update: {
          day?: string;
          msg_count?: number;
          by_provider?: Record<string, number>;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          rarity: AchievementRarity;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          icon: string;
          rarity: AchievementRarity;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          rarity?: AchievementRarity;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string | null;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string | null;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey';
            columns: ['achievement_id'];
            referencedRelation: 'achievements';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_missions: {
        Row: {
          user_id: string;
          day: string;
          missions: DailyMission[];
        };
        Insert: {
          user_id: string;
          day: string;
          missions?: DailyMission[];
        };
        Update: {
          user_id?: string;
          day?: string;
          missions?: DailyMission[];
        };
        Relationships: [
          {
            foreignKeyName: 'daily_missions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: SubscriptionStatus;
          current_period_end: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      game_scores: {
        Row: {
          id: number;
          user_id: string;
          game_id: GameId;
          score: number;
          duration_sec: number | null;
          difficulty: string | null;
          played_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_id: GameId;
          score: number;
          duration_sec?: number | null;
          difficulty?: string | null;
          played_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_id?: GameId;
          score?: number;
          duration_sec?: number | null;
          difficulty?: string | null;
          played_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'game_scores_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_focus_minutes: {
        Row: {
          user_id: string;
          day: string;
          minutes: number;
        };
        Insert: {
          user_id: string;
          day: string;
          minutes?: number;
        };
        Update: {
          user_id?: string;
          day?: string;
          minutes?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_focus_minutes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      weekly_leaderboard: {
        Row: {
          username: string;
          display_name: string;
          week_start: string;
          xp: number | null;
          questions_answered: number | null;
          position: number;
        };
        Relationships: [];
      };
      question_stats: {
        Row: {
          question_id: string;
          total_attempts: number;
          total_correct: number;
          correct_pct: number | null;
        };
        Relationships: [];
      };
      game_leaderboard: {
        Row: {
          game_id: GameId;
          username: string;
          display_name: string;
          best_score: number;
          plays: number;
          position: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      award_simulado_xp: {
        Args: { p_session_id: string };
        Returns: number;
      };
      get_diagnostic_questions: {
        Args: Record<string, never>;
        Returns: Array<{
          id: string;
          discipline: string;
          subtopic: string;
          subtopic_short: string;
          year: number;
          semester: number;
          question_num: number;
          image_url: string;
        }>;
      };
      admin_set_account_status: {
        Args: { target_user_id: string; new_status: string };
        Returns: void;
      };
      admin_list_users: {
        Args: Record<string, never>;
        Returns: Array<{
          id: string;
          email: string;
          display_name: string;
          username: string;
          account_status: string;
          is_admin: boolean;
          created_at: string;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helpers convenientes
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];
