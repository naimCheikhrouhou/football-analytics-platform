# Hasura Actions - Custom Resolvers

This directory contains implementations for custom Hasura Actions (GraphQL resolvers) that handle complex analytics queries.

## Overview

Hasura Actions allow you to create custom GraphQL resolvers for complex business logic that can't be handled by simple database queries. These are typically implemented as REST endpoints or serverless functions.

## Available Actions

### 1. Player Performance Analytics

**GraphQL Query:**
```graphql
query {
  playerPerformanceAnalytics(
    playerId: "uuid"
    startDate: "2024-01-01"
    endDate: "2024-12-31"
  ) {
    player_id
    total_matches
    total_goals
    total_assists
    average_rating
    training_attendance_rate
    match_win_rate
    performance_trend {
      date
      match_id
      rating
      goals
      assists
    }
  }
}
```

**Implementation:** Create a REST endpoint that:
1. Queries player statistics from the database
2. Calculates aggregated metrics
3. Generates performance trend data
4. Returns structured JSON response

### 2. Team Comparison Analytics

**GraphQL Query:**
```graphql
query {
  teamComparison(
    teamIds: ["uuid1", "uuid2"]
    metric: "goals_scored"
    startDate: "2024-01-01"
    endDate: "2024-12-31"
  ) {
    teams {
      team_id
      team_name
      value
      percentage_change
    }
    comparison_chart_data
  }
}
```

### 3. Training Cycle Analysis

**GraphQL Query:**
```graphql
query {
  trainingCycleAnalysis(
    playerId: "uuid"
    startDate: "2024-01-01"
    endDate: "2024-12-31"
  ) {
    player_id
    cycles {
      match_date
      days_before_match
      training_sessions {
        date
        intensity
        duration
        type
      }
      match_performance {
        match_id
        rating
        goals
        assists
      }
    }
    average_cycle_length
    recovery_days
    training_load_trend {
      date
      load
      intensity
    }
  }
}
```

## Implementation Options

### Option 1: REST API Endpoint

Create a REST API (Node.js/Express, Python/Flask, etc.) that handles the action logic:

```javascript
// Example: Express.js endpoint
app.post('/actions/player-performance-analytics', async (req, res) => {
  const { playerId, startDate, endDate } = req.body.input;
  
  // Query database
  // Calculate metrics
  // Return response
  
  res.json({
    player_id: playerId,
    total_matches: 25,
    // ... other fields
  });
});
```

### Option 2: Serverless Function

Deploy as a serverless function (Vercel, Netlify, AWS Lambda):

```javascript
// vercel/api/player-performance-analytics.js
export default async function handler(req, res) {
  // Implementation
}
```

### Option 3: Supabase Edge Functions

Use Supabase Edge Functions for serverless execution:

```typescript
// supabase/functions/player-performance-analytics/index.ts
Deno.serve(async (req) => {
  const { playerId, startDate, endDate } = await req.json();
  
  // Implementation using Supabase client
  
  return new Response(JSON.stringify(result));
});
```

## Connecting Actions to Hasura

1. **Define Action in Hasura Console:**
   - Go to **Actions** → **Create**
   - Paste the GraphQL definition from `hasura/metadata/actions.graphql`
   - Set the handler URL (your REST endpoint)

2. **Configure Permissions:**
   - Set which roles can execute each action
   - Coach: Full access
   - Analyst: Read-only analytics
   - Player: Limited to own data

3. **Test the Action:**
   - Use Hasura Console's GraphQL playground
   - Test with different user roles

## Example Implementation Structure

```
hasura/actions/
├── player-performance-analytics/
│   ├── index.js (or index.ts)
│   ├── package.json
│   └── README.md
├── team-comparison/
│   └── ...
└── training-cycle-analysis/
    └── ...
```

## Security Considerations

1. **Validate Input:** Always validate and sanitize input parameters
2. **Authentication:** Verify JWT token from Hasura
3. **Authorization:** Check user role before processing
4. **Rate Limiting:** Implement rate limiting for expensive operations
5. **Error Handling:** Return proper error responses

## Next Steps

1. Choose your implementation method (REST API, Serverless, or Edge Function)
2. Implement each action handler
3. Deploy and configure in Hasura Console
4. Test with different user roles
5. Add monitoring and logging

