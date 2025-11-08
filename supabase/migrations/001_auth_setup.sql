-- =====================================================
-- Supabase Authentication & Role-Based Access Control
-- =====================================================
-- This migration sets up:
-- 1. User roles (coach, analyst, player)
-- 2. User profiles table
-- 3. Row Level Security (RLS) policies
-- 4. Helper functions for role checking

-- =====================================================
-- Step 1: Create User Role Enum
-- =====================================================
CREATE TYPE user_role AS ENUM ('coach', 'analyst', 'player');

-- =====================================================
-- Step 2: Create User Profiles Table
-- =====================================================
-- This table extends Supabase auth.users with role information
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'player',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 3: Create Indexes
-- =====================================================
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- =====================================================
-- Step 4: Helper Functions for Role Checking
-- =====================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
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
    
    RETURN COALESCE(user_role_val, 'player'::user_role);
END;
$$;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN public.get_user_role() = required_role;
END;
$$;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles user_role[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role_val user_role;
BEGIN
    user_role_val := public.get_user_role();
    RETURN user_role_val = ANY(required_roles);
END;
$$;

-- =====================================================
-- Step 5: RLS Policies for user_profiles
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
    );

-- Coaches can view all profiles
CREATE POLICY "Coaches can view all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (public.has_role('coach'));

-- Analysts can view all profiles
CREATE POLICY "Analysts can view all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (public.has_role('analyst'));

-- =====================================================
-- Step 6: Trigger to Auto-Create Profile on User Signup
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role, full_name)
    VALUES (
        NEW.id,
        'player'::user_role, -- Default role
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Step 7: Update Timestamp Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

