# Football Project - Complete Setup Guide

This guide walks you through setting up the complete stack: Supabase Auth + Hasura GraphQL API.

## Architecture Overview

```
Frontend → Hasura GraphQL API → Supabase Postgres Database
                ↓
         Supabase Auth (JWT)
```

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Docker Desktop**: Install from [docker.com](https://www.docker.com/products/docker-desktop)
3. **Node.js**: Version 18+ recommended

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Fill in project details:
   - Name: `football-project` (or your choice)
   - Database Password: **Save this password!**
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Run migrations in order:
   - `supabase/migrations/001_auth_setup.sql`
   - `supabase/migrations/002_rls_policies_example.sql` (uncomment as needed)
   - `supabase/migrations/003_jwt_claims.sql`
   - `supabase/migrations/004_computed_fields_functions.sql` (adjust for your schema)

### 1.3 Get Connection Details

1. **Database Connection String:**
   - Go to **Settings** → **Database**
   - Copy **Connection String** → **URI**
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Replace `[PASSWORD]` with your database password

2. **JWT Secret:**
   - Go to **Settings** → **API**
   - Copy **JWT Secret** (under "JWT Settings")

3. **Project URL:**
   - Found in **Settings** → **API**
   - Format: `https://[PROJECT-REF].supabase.co`

### 1.4 Configure JWT Claims (Optional but Recommended)

1. Go to **Authentication** → **Settings** → **JWT Settings**
2. Add custom claim:
   - **Key**: `role`
   - **Value**: `auth.get_user_role_claim()`
3. Save changes

## Step 2: Set Up Hasura

### 2.1 Create Environment File

Create `.env` file in project root:

```env
# Supabase Database Connection
HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Supabase JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Hasura Admin Secret (change this!)
HASURA_ADMIN_SECRET=myadminsecretkey
```

**Important:** Never commit `.env` to git! It's already in `.gitignore`.

### 2.2 Start Hasura

```bash
# Start Hasura with Docker
npm run hasura:start

# Or manually
docker-compose up -d
```

Hasura Console will be available at: **http://localhost:8080/console**

### 2.3 Connect Database in Hasura

1. Open Hasura Console: http://localhost:8080/console
2. Go to **Data** → **Connect Database**
3. Enter your Supabase connection string
4. Click **Connect Database**

### 2.4 Track Tables

1. In Hasura Console, go to **Data** → **Your Database**
2. You should see your tables (user_profiles, etc.)
3. Click **Track All** to generate GraphQL API for all tables
4. Or manually track specific tables

### 2.5 Configure Permissions

For each table, set up role-based permissions:

1. Go to **Data** → **[Table Name]** → **Permissions**
2. Add permissions for each role:

**user_profiles table:**
- **player**: Can view own profile only
  - Select: `{"id": {"_eq": "X-Hasura-User-Id"}}`
- **coach**: Full access (select, insert, update, delete)
- **analyst**: Can view all profiles

**Other tables** (matches, players, etc.):
- **player**: Read-only access
- **coach**: Full access
- **analyst**: Read and update (no delete)

See `hasura/metadata/permissions_example.yaml` for reference.

## Step 3: Test the Setup

### 3.1 Create Test User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Enter email and password
4. Note the user ID

### 3.2 Assign Role

1. Go to Supabase Dashboard → **SQL Editor**
2. Run:

```sql
-- Make user a coach (replace with actual user ID)
UPDATE public.user_profiles
SET role = 'coach'
WHERE id = 'user-uuid-here';
```

### 3.3 Get JWT Token

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click on your user
3. Click **Generate JWT Token** (or use Supabase client in your app)

### 3.4 Test GraphQL Query

1. Open Hasura Console: http://localhost:8080/console
2. Go to **API** tab
3. Add header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
4. Run query:

```graphql
query {
  user_profiles {
    id
    role
    full_name
  }
}
```

## Step 4: Create Your Tables

When you're ready to create your actual tables (matches, players, training_sessions, etc.):

1. **Create tables in Supabase:**
   - Use SQL Editor or Table Editor
   - Enable RLS on all tables
   - Apply RLS policies from `supabase/migrations/002_rls_policies_example.sql`

2. **Track in Hasura:**
   - Tables will appear automatically
   - Click **Track** for each table
   - Configure permissions

3. **Add computed fields** (optional):
   - Use functions from `supabase/migrations/004_computed_fields_functions.sql`
   - Add as computed fields in Hasura Console

## Step 5: Set Up Custom Actions (Optional)

For complex analytics, set up Hasura Actions:

1. Define actions in `hasura/metadata/actions.graphql`
2. Create REST endpoints or serverless functions
3. Connect in Hasura Console → **Actions**
4. See `hasura/actions/README.md` for details

## Troubleshooting

### Hasura Can't Connect to Supabase

- Verify connection string is correct
- Check that password is properly URL-encoded
- Ensure your IP is whitelisted (if required)
- Check Supabase project is active

### JWT Authentication Fails

- Verify JWT secret matches Supabase settings
- Check JWT token includes `role` claim
- Ensure token hasn't expired
- Verify token format in Hasura logs

### Permissions Not Working

- Check user's role in `user_profiles` table
- Verify JWT token includes correct role
- Check Hasura permission rules
- Ensure RLS policies don't conflict

### Tables Not Appearing

- Refresh Hasura Console
- Check table is in `public` schema
- Verify database connection is active

## Next Steps

1. **Create your database schema** (matches, players, etc.)
2. **Set up frontend** to use Hasura GraphQL API
3. **Implement custom actions** for complex analytics
4. **Add computed fields** for calculated values
5. **Configure subscriptions** for real-time updates

## Useful Commands

```bash
# Hasura
npm run hasura:start      # Start Hasura
npm run hasura:stop       # Stop Hasura
npm run hasura:logs       # View logs
npm run hasura:console    # Open console (requires Hasura CLI)

# Hasura CLI (if installed)
hasura migrate apply      # Apply migrations
hasura metadata apply   # Apply metadata
hasura console           # Open console
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Hasura Documentation](https://hasura.io/docs)
- [Hasura + Supabase Guide](https://hasura.io/docs/latest/guides/integrations/supabase/)
- [GraphQL Best Practices](https://hasura.io/learn/graphql/best-practices/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase and Hasura logs
3. Consult the documentation links
4. Check GitHub issues for common problems

