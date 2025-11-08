# Hasura GraphQL API Setup

This directory contains the Hasura GraphQL Engine configuration for connecting to your Supabase Postgres database.

## Overview

Hasura automatically generates GraphQL queries, mutations, and subscriptions for all your database tables. It integrates seamlessly with Supabase Auth using JWT tokens.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with a Postgres database
2. **Docker**: Install Docker Desktop
3. **Hasura CLI** (optional): For managing migrations and metadata

## Setup Instructions

### 1. Get Your Supabase Connection String

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection String** (use the "URI" format)
4. Replace the password placeholder with your database password

Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Get Your Supabase JWT Secret

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **JWT Secret** (under "JWT Settings")

### 3. Create Environment File

Create a `.env` file in the project root:

```env
# Supabase Database Connection
HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Hasura Admin Secret (change this!)
HASURA_ADMIN_SECRET=myadminsecretkey
```

### 4. Start Hasura

```bash
docker-compose up -d
```

Hasura Console will be available at: http://localhost:8080/console

### 5. Connect to Supabase Database

1. Open Hasura Console: http://localhost:8080/console
2. Go to **Data** → **Connect Database**
3. Enter your Supabase connection string
4. Click **Connect Database**

### 6. Track Tables

1. In Hasura Console, go to **Data** → **Your Database**
2. Click **Track All** to automatically generate GraphQL API for all tables
3. Or manually track specific tables

### 7. Configure Permissions

Hasura uses role-based permissions that integrate with Supabase Auth:

1. Go to **Data** → **Your Table** → **Permissions**
2. Configure permissions for each role:
   - **coach**: Full access (select, insert, update, delete)
   - **analyst**: Read and update (select, insert, update)
   - **player**: Limited read access (select with filters)

Example permission for `matches` table:
- **Role**: `player**
   - **Select**: Allow all rows
   - **Insert**: None
   - **Update**: None
   - **Delete**: None

- **Role**: `coach`
   - **Select**: Allow all rows
   - **Insert**: Allow all rows
   - **Update**: Allow all rows
   - **Delete**: Allow all rows

## JWT Configuration

Hasura is configured to validate JWT tokens from Supabase. The JWT secret is set in `docker-compose.yml`.

The JWT token from Supabase includes:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "coach" | "analyst" | "player",
  "iat": 1234567890,
  "exp": 1234567890
}
```

Hasura will extract the `role` claim and use it for permission checks.

## Custom Resolvers & Actions

For complex analytics that can't be handled by simple GraphQL queries, use Hasura Actions:

1. Define the action in `hasura/metadata/actions.graphql`
2. Create a REST endpoint or serverless function to handle the logic
3. Connect it in Hasura Console → **Actions**

Example actions are defined in `hasura/metadata/actions.graphql`:
- `playerPerformanceAnalytics`: Complex player statistics
- `teamComparison`: Team comparison analytics
- `trainingCycleAnalysis`: Training cycle calculations

## Computed Fields

For computed values based on database functions, use computed fields:

1. Create a PostgreSQL function in your Supabase database
2. Add it as a computed field in Hasura Console → **Data** → **Your Table** → **Computed Fields**

Example SQL function:
```sql
CREATE OR REPLACE FUNCTION get_player_full_name(player_row players)
RETURNS TEXT AS $$
  SELECT player_row.first_name || ' ' || player_row.last_name;
$$ LANGUAGE sql STABLE;
```

## Testing the API

### Using GraphQL Playground

1. Open Hasura Console: http://localhost:8080/console
2. Go to **API** tab
3. Test queries with authentication headers:

```graphql
query GetMatches {
  matches {
    id
    date
    home_team
    away_team
    score
  }
}
```

### Using cURL

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -d '{
    "query": "query { matches { id date } }"
  }'
```

### Using JavaScript/TypeScript

```javascript
const response = await fetch('http://localhost:8080/v1/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseToken}`
  },
  body: JSON.stringify({
    query: `
      query GetMatches {
        matches {
          id
          date
          home_team
          away_team
        }
      }
    `
  })
});
```

## Hasura CLI (Optional)

Install Hasura CLI for managing migrations:

```bash
# Install Hasura CLI
npm install -g hasura-cli

# Or use npx
npx hasura-cli
```

### Common CLI Commands

```bash
# Initialize Hasura project (already done)
hasura init

# Apply metadata
hasura metadata apply

# Create migration
hasura migrate create <migration_name> --sql-file <file_name>

# Apply migrations
hasura migrate apply

# Open console
hasura console
```

## Production Deployment

For production, consider:

1. **Use Hasura Cloud** or deploy to your own infrastructure
2. **Set strong admin secret** in environment variables
3. **Enable allow list** for security
4. **Use HTTPS** for all connections
5. **Configure CORS** properly for your frontend domain
6. **Set up monitoring** and logging

## Troubleshooting

### Connection Issues
- Verify your Supabase connection string is correct
- Check that your IP is whitelisted in Supabase (if required)
- Ensure the database password is correct

### JWT Issues
- Verify the JWT secret matches Supabase settings
- Check that the JWT token includes the `role` claim
- Ensure the token hasn't expired

### Permission Issues
- Check that RLS policies in Supabase don't conflict with Hasura permissions
- Verify the user's role in the JWT token
- Check Hasura permission rules in the console

## Resources

- [Hasura Documentation](https://hasura.io/docs)
- [Hasura + Supabase Guide](https://hasura.io/docs/latest/guides/integrations/supabase/)
- [GraphQL Best Practices](https://hasura.io/learn/graphql/best-practices/)

