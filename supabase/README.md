# Supabase Authentication Setup

This directory contains SQL migrations for setting up Supabase authentication with role-based access control (RBAC) and Row Level Security (RLS).

## Overview

The authentication system uses:
- **Supabase Auth**: JWT-based authentication
- **Custom Roles**: coach, analyst, player
- **Row Level Security (RLS)**: Table-level access control
- **User Profiles**: Extended user information with roles

## Migration Files

### 001_auth_setup.sql
Sets up the core authentication infrastructure:
- Creates `user_role` enum (coach, analyst, player)
- Creates `user_profiles` table
- Creates helper functions for role checking
- Sets up RLS policies for user_profiles
- Creates trigger to auto-create profile on signup

### 002_rls_policies_example.sql
Contains example RLS policies for common tables:
- matches
- players
- training_sessions
- player_statistics
- team_statistics

**Note**: Uncomment and adjust these policies when you create your actual tables.

### 003_jwt_claims.sql
Sets up JWT claims configuration to include user role in the JWT token.

## Setup Instructions

### 1. Run Migrations

If using Supabase CLI:
```bash
supabase db push
```

Or run the SQL files directly in your Supabase SQL Editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001, 002, 003)

### 2. Configure JWT Claims

To include the user role in JWT tokens:

1. Go to Supabase Dashboard → Authentication → Settings → JWT Settings
2. Add a custom claim:
   - **Key**: `role`
   - **Value**: `auth.get_user_role_claim()`

Or use the Supabase Management API to configure it programmatically.

### 3. Apply RLS Policies to Your Tables

When you create your tables (matches, players, etc.), uncomment and adjust the policies in `002_rls_policies_example.sql` to match your schema.

## Role Permissions

### Coach
- Full access to all data
- Can create, read, update, and delete matches, players, training sessions
- Can view all user profiles
- Can manage player statistics

### Analyst
- Read access to all data
- Can create and update matches, players, training sessions
- Can view all user profiles
- Can manage statistics (but cannot delete)

### Player
- Can view their own profile and statistics
- Can view matches and training sessions
- Limited write access (typically read-only for most data)

## Helper Functions

### `get_user_role()`
Returns the current user's role.

```sql
SELECT public.get_user_role();
-- Returns: 'coach' | 'analyst' | 'player'
```

### `has_role(required_role)`
Checks if the current user has a specific role.

```sql
SELECT public.has_role('coach');
-- Returns: true | false
```

### `has_any_role(required_roles[])`
Checks if the current user has any of the specified roles.

```sql
SELECT public.has_any_role(ARRAY['coach', 'analyst']::user_role[]);
-- Returns: true | false
```

## Usage in RLS Policies

Example RLS policy using the helper functions:

```sql
CREATE POLICY "Coaches can update matches"
    ON public.matches
    FOR UPDATE
    USING (public.has_role('coach'))
    WITH CHECK (public.has_role('coach'));
```

## Assigning Roles to Users

To assign a role to a user, update the `user_profiles` table:

```sql
-- Make a user a coach
UPDATE public.user_profiles
SET role = 'coach'
WHERE id = 'user-uuid-here';

-- Make a user an analyst
UPDATE public.user_profiles
SET role = 'analyst'
WHERE id = 'user-uuid-here';
```

**Note**: Only users with appropriate permissions (typically coaches or admins) should be able to change roles. You may want to add a policy restricting role updates.

## Testing

1. Create test users in Supabase Auth
2. Assign roles via `user_profiles` table
3. Test RLS policies by querying tables with different user contexts
4. Verify JWT tokens include the role claim

## Security Notes

- All helper functions use `SECURITY DEFINER` to run with elevated privileges
- RLS is enabled on all tables containing sensitive data
- Users can only view/update their own profiles (except coaches/analysts)
- Role changes should be restricted to authorized users only

