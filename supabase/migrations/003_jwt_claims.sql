-- =====================================================
-- JWT Claims Configuration
-- =====================================================
-- This sets up custom JWT claims so the user's role
-- is available in the JWT token for use in RLS policies
-- and application logic

-- =====================================================
-- Function to Get User Role for JWT Claims
-- =====================================================
-- This function is called by Supabase to include the role in the JWT token

CREATE OR REPLACE FUNCTION auth.get_user_role_claim()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val
    FROM public.user_profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role_val::TEXT, 'player');
END;
$$;

-- =====================================================
-- Note: JWT Claims Configuration
-- =====================================================
-- To enable the role in JWT tokens, you need to configure
-- this in your Supabase Dashboard:
--
-- 1. Go to Authentication > Settings > JWT Settings
-- 2. Add a custom claim:
--    - Key: role
--    - Value: auth.get_user_role_claim()
--
-- Alternatively, you can use the Supabase Management API
-- or configure it via the Supabase CLI config file.
--
-- The JWT will then include:
-- {
--   "role": "coach" | "analyst" | "player",
--   "sub": "user-uuid",
--   ...
-- }

