# Quick Start Guide

Get your Football Analytics Platform up and running in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 3: Start Hasura (if not running)

```bash
npm run hasura:start
```

## Step 4: Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dashboard!

## Example GraphQL Query

The frontend includes an example query matching your requirements:

```typescript
const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    players_by_pk(id: $id) {
      id
      first_name
      last_name
      position
      player_statistics {
        goals
        assists
        rating
      }
    }
  }
`;
```

See `components/PlayerExample.tsx` for the full implementation.

## Features Included

✅ **Next.js 14** with App Router  
✅ **Apollo Client** for GraphQL  
✅ **Supabase Auth** integration  
✅ **Recharts** for data visualization  
✅ **TypeScript** support  
✅ **Tailwind CSS** for styling  

## Next Steps

1. Create your database tables in Supabase
2. Track tables in Hasura Console
3. Configure permissions for each role
4. Customize the dashboard components
5. Add authentication pages (login/signup)

For detailed setup instructions, see:
- `SETUP_GUIDE.md` - Complete backend setup
- `README_FRONTEND.md` - Frontend documentation

