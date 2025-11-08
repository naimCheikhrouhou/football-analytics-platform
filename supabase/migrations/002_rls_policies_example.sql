-- =====================================================
-- Example RLS Policies for Common Tables
-- =====================================================
-- This file contains example RLS policies for:
-- - matches
-- - players
-- - training_sessions
-- - player_statistics
-- 
-- Adjust these policies based on your actual table schemas

-- =====================================================
-- Example: Matches Table Policies
-- =====================================================
-- Uncomment and adjust when you create your matches table

/*
-- Enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view matches
CREATE POLICY "Authenticated users can view matches"
    ON public.matches
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only coaches can insert matches
CREATE POLICY "Coaches can insert matches"
    ON public.matches
    FOR INSERT
    WITH CHECK (public.has_role('coach'));

-- Only coaches and analysts can update matches
CREATE POLICY "Coaches and analysts can update matches"
    ON public.matches
    FOR UPDATE
    USING (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]))
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches can delete matches
CREATE POLICY "Coaches can delete matches"
    ON public.matches
    FOR DELETE
    USING (public.has_role('coach'));
*/

-- =====================================================
-- Example: Players Table Policies
-- =====================================================

/*
-- Enable RLS on players table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view players
CREATE POLICY "Authenticated users can view players"
    ON public.players
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Players can view their own profile
CREATE POLICY "Players can view own profile"
    ON public.players
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        public.has_any_role(ARRAY['coach', 'analyst']::user_role[])
    );

-- Only coaches can insert players
CREATE POLICY "Coaches can insert players"
    ON public.players
    FOR INSERT
    WITH CHECK (public.has_role('coach'));

-- Coaches and analysts can update players
CREATE POLICY "Coaches and analysts can update players"
    ON public.players
    FOR UPDATE
    USING (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]))
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches can delete players
CREATE POLICY "Coaches can delete players"
    ON public.players
    FOR DELETE
    USING (public.has_role('coach'));
*/

-- =====================================================
-- Example: Training Sessions Table Policies
-- =====================================================

/*
-- Enable RLS on training_sessions table
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view training sessions
CREATE POLICY "Authenticated users can view training sessions"
    ON public.training_sessions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Players can view their own training sessions
CREATE POLICY "Players can view own training sessions"
    ON public.training_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.training_attendance
            WHERE training_attendance.training_id = training_sessions.id
            AND training_attendance.player_id = auth.uid()
        ) OR
        public.has_any_role(ARRAY['coach', 'analyst']::user_role[])
    );

-- Only coaches can insert training sessions
CREATE POLICY "Coaches can insert training sessions"
    ON public.training_sessions
    FOR INSERT
    WITH CHECK (public.has_role('coach'));

-- Coaches and analysts can update training sessions
CREATE POLICY "Coaches and analysts can update training sessions"
    ON public.training_sessions
    FOR UPDATE
    USING (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]))
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches can delete training sessions
CREATE POLICY "Coaches can delete training sessions"
    ON public.training_sessions
    FOR DELETE
    USING (public.has_role('coach'));
*/

-- =====================================================
-- Example: Player Statistics Table Policies
-- =====================================================

/*
-- Enable RLS on player_statistics table
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view player statistics
CREATE POLICY "Authenticated users can view player statistics"
    ON public.player_statistics
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Players can view their own statistics
CREATE POLICY "Players can view own statistics"
    ON public.player_statistics
    FOR SELECT
    USING (
        player_id = auth.uid() OR
        public.has_any_role(ARRAY['coach', 'analyst']::user_role[])
    );

-- Only coaches and analysts can insert player statistics
CREATE POLICY "Coaches and analysts can insert player statistics"
    ON public.player_statistics
    FOR INSERT
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches and analysts can update player statistics
CREATE POLICY "Coaches and analysts can update player statistics"
    ON public.player_statistics
    FOR UPDATE
    USING (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]))
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches can delete player statistics
CREATE POLICY "Coaches can delete player statistics"
    ON public.player_statistics
    FOR DELETE
    USING (public.has_role('coach'));
*/

-- =====================================================
-- Example: Team Statistics Table Policies
-- =====================================================

/*
-- Enable RLS on team_statistics table
ALTER TABLE public.team_statistics ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view team statistics
CREATE POLICY "Authenticated users can view team statistics"
    ON public.team_statistics
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only coaches and analysts can insert team statistics
CREATE POLICY "Coaches and analysts can insert team statistics"
    ON public.team_statistics
    FOR INSERT
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches and analysts can update team statistics
CREATE POLICY "Coaches and analysts can update team statistics"
    ON public.team_statistics
    FOR UPDATE
    USING (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]))
    WITH CHECK (public.has_any_role(ARRAY['coach', 'analyst']::user_role[]));

-- Only coaches can delete team statistics
CREATE POLICY "Coaches can delete team statistics"
    ON public.team_statistics
    FOR DELETE
    USING (public.has_role('coach'));
*/

