-- ============================================
-- Схема базы данных для Гимназической мини-футбольной лиги
-- Выполните этот скрипт в SQL Editor Supabase
-- ============================================

-- 1. Профили пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Триггер: при регистрации создаём профиль
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Сезоны
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  system TEXT NOT NULL DEFAULT 'round_robin' 
    CHECK (system IN ('round_robin', 'groups', 'playoff', 'swiss')),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Команды
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  emblem_url TEXT,
  color_primary TEXT DEFAULT '#16a34a',
  color_secondary TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, name)
);

-- 4. Игроки
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  number INTEGER,
  position TEXT DEFAULT 'MID' CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Туры (раунды)
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, number)
);

-- 6. Матчи
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL,
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE,
  match_time TIME,
  status TEXT DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled')),
  venue TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (home_team_id <> away_team_id)
);

-- 7. События матча (голы, ассисты, карточки, сейвы)
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL 
    CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'own_goal', 'save')),
  minute INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Представления (Views) для статистики
-- ============================================

-- Турнирная таблица
CREATE OR REPLACE VIEW public.standings AS
WITH match_results AS (
  SELECT
    m.season_id,
    m.home_team_id AS team_id,
    CASE 
      WHEN m.status = 'finished' AND m.home_score > m.away_score THEN 3
      WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1
      ELSE 0
    END AS points,
    CASE WHEN m.status = 'finished' THEN 1 ELSE 0 END AS played,
    CASE WHEN m.status = 'finished' AND m.home_score > m.away_score THEN 1 ELSE 0 END AS won,
    CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 ELSE 0 END AS drawn,
    CASE WHEN m.status = 'finished' AND m.home_score < m.away_score THEN 1 ELSE 0 END AS lost,
    COALESCE(m.home_score, 0) AS goals_for,
    COALESCE(m.away_score, 0) AS goals_against
  FROM public.matches m
  WHERE m.status = 'finished'
  
  UNION ALL
  
  SELECT
    m.season_id,
    m.away_team_id AS team_id,
    CASE 
      WHEN m.status = 'finished' AND m.away_score > m.home_score THEN 3
      WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1
      ELSE 0
    END AS points,
    CASE WHEN m.status = 'finished' THEN 1 ELSE 0 END AS played,
    CASE WHEN m.status = 'finished' AND m.away_score > m.home_score THEN 1 ELSE 0 END AS won,
    CASE WHEN m.status = 'finished' AND m.home_score = m.away_score THEN 1 ELSE 0 END AS drawn,
    CASE WHEN m.status = 'finished' AND m.away_score < m.home_score THEN 1 ELSE 0 END AS lost,
    COALESCE(m.away_score, 0) AS goals_for,
    COALESCE(m.home_score, 0) AS goals_against
  FROM public.matches m
  WHERE m.status = 'finished'
)
SELECT
  t.id AS team_id,
  t.name AS team_name,
  t.season_id,
  COALESCE(SUM(mr.played), 0)::INTEGER AS played,
  COALESCE(SUM(mr.won), 0)::INTEGER AS won,
  COALESCE(SUM(mr.drawn), 0)::INTEGER AS drawn,
  COALESCE(SUM(mr.lost), 0)::INTEGER AS lost,
  COALESCE(SUM(mr.goals_for), 0)::INTEGER AS goals_for,
  COALESCE(SUM(mr.goals_against), 0)::INTEGER AS goals_against,
  (COALESCE(SUM(mr.goals_for), 0) - COALESCE(SUM(mr.goals_against), 0))::INTEGER AS goal_diff,
  COALESCE(SUM(mr.points), 0)::INTEGER AS points
FROM public.teams t
LEFT JOIN match_results mr ON t.id = mr.team_id AND t.season_id = mr.season_id
GROUP BY t.id, t.name, t.season_id
ORDER BY points DESC, goal_diff DESC, goals_for DESC;

-- Лучшие бомбардиры
CREATE OR REPLACE VIEW public.top_scorers AS
SELECT
  p.id AS player_id,
  p.first_name || ' ' || p.last_name AS player_name,
  t.name AS team_name,
  t.season_id,
  COUNT(*)::INTEGER AS goals
FROM public.match_events me
JOIN public.players p ON me.player_id = p.id
JOIN public.teams t ON me.team_id = t.id
WHERE me.event_type = 'goal'
GROUP BY p.id, p.first_name, p.last_name, t.name, t.season_id
ORDER BY goals DESC;

-- Лучшие ассистенты
CREATE OR REPLACE VIEW public.top_assists AS
SELECT
  p.id AS player_id,
  p.first_name || ' ' || p.last_name AS player_name,
  t.name AS team_name,
  t.season_id,
  COUNT(*)::INTEGER AS assists
FROM public.match_events me
JOIN public.players p ON me.player_id = p.id
JOIN public.teams t ON me.team_id = t.id
WHERE me.event_type = 'assist'
GROUP BY p.id, p.first_name, p.last_name, t.name, t.season_id
ORDER BY assists DESC;

-- Лучшие вратари (по "сухим" матчам + сейвам)
CREATE OR REPLACE VIEW public.top_goalkeepers AS
WITH clean_sheets AS (
  SELECT
    p.id AS player_id,
    COUNT(*) AS cs
  FROM public.matches m
  JOIN public.players p ON (
    (m.home_team_id = p.team_id AND m.away_score = 0) OR
    (m.away_team_id = p.team_id AND m.home_score = 0)
  )
  WHERE m.status = 'finished' AND p.position = 'GK'
  GROUP BY p.id
),
saves AS (
  SELECT
    me.player_id,
    COUNT(*) AS save_count
  FROM public.match_events me
  WHERE me.event_type = 'save'
  GROUP BY me.player_id
)
SELECT
  p.id AS player_id,
  p.first_name || ' ' || p.last_name AS player_name,
  t.name AS team_name,
  t.season_id,
  COALESCE(cs.cs, 0)::INTEGER AS clean_sheets,
  COALESCE(s.save_count, 0)::INTEGER AS saves
FROM public.players p
JOIN public.teams t ON p.team_id = t.id
LEFT JOIN clean_sheets cs ON p.id = cs.player_id
LEFT JOIN saves s ON p.id = s.player_id
WHERE p.position = 'GK'
ORDER BY clean_sheets DESC, saves DESC;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Политики: все могут читать
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.match_events FOR SELECT USING (true);

-- Только админы могут изменять
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage seasons" ON public.seasons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage players" ON public.players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage rounds" ON public.rounds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage matches" ON public.matches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage events" ON public.match_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Пользователь может обновлять свой профиль
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Storage для эмблем
-- ============================================
-- В Dashboard Supabase → Storage создайте бакет "emblems" (public)
-- Затем выполните:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('emblems', 'emblems', true);

-- Политика для Storage (выполнить после создания бакета)
-- CREATE POLICY "Public read emblems" ON storage.objects FOR SELECT USING (bucket_id = 'emblems');
-- CREATE POLICY "Admins upload emblems" ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'emblems' AND EXISTS (
--     SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
--   ));
