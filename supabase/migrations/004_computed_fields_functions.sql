-- =====================================================
-- Computed Fields Functions for Hasura
-- =====================================================
-- These PostgreSQL functions can be used as computed fields
-- in Hasura for complex calculations and analytics

-- =====================================================
-- Example: Player Full Name
-- =====================================================
-- Usage: Add as computed field in Hasura for players table
CREATE OR REPLACE FUNCTION public.get_player_full_name(player_row public.players)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(player_row.first_name || ' ' || player_row.last_name, player_row.first_name, player_row.last_name, 'Unknown');
$$;

-- =====================================================
-- Example: Match Goal Difference
-- =====================================================
-- Usage: Add as computed field in Hasura for matches table
CREATE OR REPLACE FUNCTION public.calculate_goal_difference(match_row public.matches)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(match_row.goals_for, 0) - COALESCE(match_row.goals_against, 0);
$$;

-- =====================================================
-- Example: Player Match Count
-- =====================================================
-- Usage: Add as computed field in Hasura for players table
CREATE OR REPLACE FUNCTION public.get_player_match_count(player_row public.players)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)
  FROM public.player_statistics
  WHERE player_id = player_row.id;
$$;

-- =====================================================
-- Example: Player Total Goals
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_player_total_goals(player_row public.players)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(goals), 0)
  FROM public.player_statistics
  WHERE player_id = player_row.id;
$$;

-- =====================================================
-- Example: Player Total Assists
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_player_total_assists(player_row public.players)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(assists), 0)
  FROM public.player_statistics
  WHERE player_id = player_row.id;
$$;

-- =====================================================
-- Example: Player Average Rating
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_player_average_rating(player_row public.players)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.player_statistics
  WHERE player_id = player_row.id;
$$;

-- =====================================================
-- Example: Match Win/Loss/Draw Status
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_match_result(match_row public.matches)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN match_row.goals_for > match_row.goals_against THEN 'win'
    WHEN match_row.goals_for < match_row.goals_against THEN 'loss'
    WHEN match_row.goals_for = match_row.goals_against THEN 'draw'
    ELSE 'unknown'
  END;
$$;

-- =====================================================
-- Example: Training Attendance Rate
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_training_attendance_rate(player_row public.players)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN COUNT(DISTINCT ts.id) = 0 THEN 0
      ELSE ROUND(
        (COUNT(DISTINCT ta.training_id)::NUMERIC / COUNT(DISTINCT ts.id)::NUMERIC) * 100,
        2
      )
    END
  FROM public.training_sessions ts
  LEFT JOIN public.training_attendance ta 
    ON ta.training_id = ts.id 
    AND ta.player_id = player_row.id;
$$;

-- =====================================================
-- Example: Days Until Next Match
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_days_until_next_match()
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT EXTRACT(DAY FROM (MIN(date) - CURRENT_DATE))
  FROM public.matches
  WHERE date > CURRENT_DATE;
$$;

-- =====================================================
-- Example: Team Win Rate
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_team_win_rate(team_id_param UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(
        (COUNT(CASE WHEN goals_for > goals_against THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100,
        2
      )
    END
  FROM public.matches
  WHERE team_id = team_id_param;
$$;

-- =====================================================
-- Note: Adjust these functions based on your actual table schemas
-- =====================================================
-- When you create your actual tables (matches, players, etc.),
-- you may need to adjust column names and table references
-- in these functions to match your schema.

