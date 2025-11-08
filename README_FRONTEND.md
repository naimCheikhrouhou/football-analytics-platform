# Frontend Setup Guide

This guide explains how to set up and run the Next.js frontend with Apollo Client and charting libraries.

## Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Hasura running (see main SETUP_GUIDE.md)

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from:
- **Hasura URL**: Your Hasura endpoint (default: http://localhost:8080/v1/graphql)
- **Supabase URL & Key**: Supabase Dashboard → Settings → API

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  ├── layout.tsx          # Root layout with Apollo Provider
  ├── page.tsx            # Home/dashboard page
  ├── players/
  │   └── [id]/
  │       └── page.tsx    # Individual player page
  └── globals.css         # Global styles

components/
  ├── ApolloWrapper.tsx   # Apollo Client provider
  ├── PlayerStatsChart.tsx # Player performance charts
  ├── PlayerComparisonChart.tsx # Player comparison radar chart
  └── MatchStatsChart.tsx # Match statistics charts

lib/
  ├── apollo-client.ts    # Apollo Client configuration
  ├── supabase-client.ts  # Supabase client setup
  └── graphql/
      ├── queries.ts      # GraphQL queries
      └── mutations.ts    # GraphQL mutations
```

## Key Features

### Apollo Client Integration

The Apollo Client is configured to:
- Automatically include JWT tokens from Supabase in requests
- Handle authentication errors
- Cache queries efficiently
- Support real-time subscriptions

### GraphQL Queries

Example queries are defined in `lib/graphql/queries.ts`:

```typescript
import { GET_PLAYER } from '@/lib/graphql/queries';
import { useQuery } from '@apollo/client';

function PlayerComponent({ playerId }: { playerId: string }) {
  const { data, loading, error } = useQuery(GET_PLAYER, {
    variables: { id: playerId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.players_by_pk.first_name}</div>;
}
```

### Charting with Recharts

The project uses Recharts for data visualization:

- **Line Charts**: Performance trends over time
- **Bar Charts**: Goals, assists, match statistics
- **Radar Charts**: Multi-dimensional player comparisons

Example component: `components/PlayerStatsChart.tsx`

### Authentication

Authentication is handled through Supabase:

```typescript
import { supabase } from '@/lib/supabase-client';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Example Usage

### Querying Players

```typescript
import { useQuery } from '@apollo/client';
import { GET_PLAYERS } from '@/lib/graphql/queries';

function PlayersList() {
  const { data, loading, error } = useQuery(GET_PLAYERS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.players.map((player: any) => (
        <li key={player.id}>
          {player.first_name} {player.last_name}
        </li>
      ))}
    </ul>
  );
}
```

### Creating a Match

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_MATCH } from '@/lib/graphql/mutations';

function CreateMatchForm() {
  const [createMatch, { loading, error }] = useMutation(CREATE_MATCH);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMatch({
      variables: {
        match: {
          date: '2024-11-10',
          home_team: 'Team A',
          away_team: 'Team B',
          competition: 'League',
        },
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Displaying Charts

```typescript
import { PlayerStatsChart } from '@/components/PlayerStatsChart';

function PlayerPage({ playerId }: { playerId: string }) {
  return <PlayerStatsChart playerId={playerId} />;
}
```

## Customization

### Adding New Queries

1. Add query to `lib/graphql/queries.ts`:

```typescript
export const GET_NEW_DATA = gql`
  query GetNewData {
    new_table {
      id
      name
    }
  }
`;
```

2. Use in components:

```typescript
const { data } = useQuery(GET_NEW_DATA);
```

### Adding New Charts

1. Create component in `components/`:

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { LineChart, Line, ... } from 'recharts';

export function NewChart() {
  // Fetch data and render chart
}
```

2. Import and use in pages.

## Troubleshooting

### GraphQL Errors

- Check that Hasura is running: `npm run hasura:start`
- Verify the Hasura URL in `.env.local`
- Check browser console for detailed error messages

### Authentication Issues

- Ensure Supabase credentials are correct in `.env.local`
- Check that JWT tokens are being included in requests
- Verify user has proper role in `user_profiles` table

### Chart Not Rendering

- Ensure data is properly formatted for Recharts
- Check that all required fields are present in GraphQL query
- Verify responsive container has proper dimensions

## Next Steps

1. **Add Authentication Pages**: Login, signup, logout
2. **Create More Pages**: Matches list, player profiles, training sessions
3. **Add More Charts**: Team comparisons, training load analysis
4. **Implement Real-time**: Use GraphQL subscriptions for live updates
5. **Add PDF Generation**: For reports (as mentioned in context.txt)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Recharts Documentation](https://recharts.org/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

