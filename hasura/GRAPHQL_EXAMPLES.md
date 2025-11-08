# GraphQL API Examples

This document provides example GraphQL queries and mutations that will be available once you track your tables in Hasura.

## Authentication

All queries require a JWT token from Supabase Auth in the `Authorization` header:

```
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

## User Profiles

### Get Current User Profile

```graphql
query GetMyProfile {
  user_profiles(where: { id: { _eq: "X-Hasura-User-Id" } }) {
    id
    role
    full_name
    created_at
    updated_at
  }
}
```

### Get All User Profiles (Coach/Analyst only)

```graphql
query GetAllProfiles {
  user_profiles {
    id
    role
    full_name
    created_at
  }
}
```

### Update My Profile

```graphql
mutation UpdateMyProfile($full_name: String) {
  update_user_profiles(
    where: { id: { _eq: "X-Hasura-User-Id" } }
    _set: { full_name: $full_name }
  ) {
    affected_rows
    returning {
      id
      full_name
    }
  }
}
```

## Matches (Example - adjust for your schema)

### Get All Matches

```graphql
query GetMatches {
  matches(order_by: { date: desc }) {
    id
    date
    home_team
    away_team
    goals_for
    goals_against
    competition
    venue
  }
}
```

### Get Match with Statistics

```graphql
query GetMatchWithStats($matchId: uuid!) {
  matches_by_pk(id: $matchId) {
    id
    date
    home_team
    away_team
    goals_for
    goals_against
    player_statistics {
      player {
        id
        first_name
        last_name
      }
      goals
      assists
      rating
    }
  }
}
```

### Create Match (Coach only)

```graphql
mutation CreateMatch($match: matches_insert_input!) {
  insert_matches_one(object: $match) {
    id
    date
    home_team
    away_team
  }
}
```

Variables:
```json
{
  "match": {
    "date": "2024-11-10",
    "home_team": "Team A",
    "away_team": "Team B",
    "competition": "League"
  }
}
```

### Update Match (Coach/Analyst)

```graphql
mutation UpdateMatch($id: uuid!, $updates: matches_set_input!) {
  update_matches_by_pk(pk_columns: { id: $id }, _set: $updates) {
    id
    goals_for
    goals_against
  }
}
```

## Players (Example - adjust for your schema)

### Get All Players

```graphql
query GetPlayers {
  players {
    id
    first_name
    last_name
    position
    jersey_number
    date_of_birth
  }
}
```

### Get Player with Statistics

```graphql
query GetPlayerWithStats($playerId: uuid!) {
  players_by_pk(id: $playerId) {
    id
    first_name
    last_name
    position
    player_statistics {
      match {
        id
        date
        home_team
        away_team
      }
      goals
      assists
      rating
    }
  }
}
```

### Get Player Performance Summary

```graphql
query GetPlayerPerformance($playerId: uuid!) {
  players_by_pk(id: $playerId) {
    id
    first_name
    last_name
    # Computed fields (if configured)
    match_count
    total_goals
    total_assists
    average_rating
    training_attendance_rate
  }
}
```

## Training Sessions (Example - adjust for your schema)

### Get Training Sessions

```graphql
query GetTrainingSessions($startDate: date!, $endDate: date!) {
  training_sessions(
    where: {
      date: { _gte: $startDate, _lte: $endDate }
    }
    order_by: { date: desc }
  ) {
    id
    date
    type
    intensity
    duration
    attendance {
      player {
        id
        first_name
        last_name
      }
      attended
    }
  }
}
```

### Get My Training Sessions (Player)

```graphql
query GetMyTrainingSessions {
  training_sessions(
    where: {
      attendance: {
        player_id: { _eq: "X-Hasura-User-Id" }
      }
    }
    order_by: { date: desc }
  ) {
    id
    date
    type
    intensity
    attendance(where: { player_id: { _eq: "X-Hasura-User-Id" } }) {
      attended
    }
  }
}
```

## Advanced Queries

### Filtered and Paginated Matches

```graphql
query GetFilteredMatches(
  $limit: Int!
  $offset: Int!
  $competition: String
  $startDate: date
  $endDate: date
) {
  matches(
    where: {
      competition: { _eq: $competition }
      date: { _gte: $startDate, _lte: $endDate }
    }
    order_by: { date: desc }
    limit: $limit
    offset: $offset
  ) {
    id
    date
    home_team
    away_team
    goals_for
    goals_against
  }
  matches_aggregate(
    where: {
      competition: { _eq: $competition }
      date: { _gte: $startDate, _lte: $endDate }
    }
  ) {
    aggregate {
      count
    }
  }
}
```

### Player Comparison

```graphql
query ComparePlayers($playerIds: [uuid!]!) {
  players(where: { id: { _in: $playerIds } }) {
    id
    first_name
    last_name
    position
    # Computed fields
    total_goals
    total_assists
    average_rating
    match_count
    player_statistics {
      goals
      assists
      rating
    }
  }
}
```

### Team Statistics

```graphql
query GetTeamStats($teamId: uuid!, $season: String!) {
  matches(
    where: {
      team_id: { _eq: $teamId }
      season: { _eq: $season }
    }
  ) {
    id
    goals_for
    goals_against
    # Computed field
    result
  }
  matches_aggregate(
    where: {
      team_id: { _eq: $teamId }
      season: { _eq: $season }
    }
  ) {
    aggregate {
      count
    }
  }
}
```

## Subscriptions (Real-time)

### Subscribe to Match Updates

```graphql
subscription WatchMatches {
  matches(order_by: { date: desc }, limit: 10) {
    id
    date
    home_team
    away_team
    goals_for
    goals_against
  }
}
```

### Subscribe to Player Statistics

```graphql
subscription WatchPlayerStats($playerId: uuid!) {
  player_statistics(
    where: { player_id: { _eq: $playerId } }
    order_by: { match: { date: desc } }
    limit: 10
  ) {
    id
    match {
      id
      date
    }
    goals
    assists
    rating
  }
}
```

## Custom Actions (Analytics)

### Player Performance Analytics

```graphql
query GetPlayerAnalytics(
  $playerId: uuid!
  $startDate: date
  $endDate: date
) {
  playerPerformanceAnalytics(
    playerId: $playerId
    startDate: $startDate
    endDate: $endDate
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

### Training Cycle Analysis

```graphql
query GetTrainingCycle(
  $playerId: uuid!
  $startDate: date!
  $endDate: date!
) {
  trainingCycleAnalysis(
    playerId: $playerId
    startDate: $startDate
    endDate: $endDate
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

## Error Handling

GraphQL errors will be returned in this format:

```json
{
  "errors": [
    {
      "message": "permission denied for table matches",
      "extensions": {
        "code": "permission-denied",
        "path": "$.selectionSet.matches"
      }
    }
  ],
  "data": null
}
```

## Tips

1. **Use Fragments** for reusable field sets:
```graphql
fragment PlayerBasicInfo on players {
  id
  first_name
  last_name
  position
}

query {
  players {
    ...PlayerBasicInfo
  }
}
```

2. **Use Variables** for dynamic queries (prevents injection attacks)

3. **Use Aggregations** for statistics:
```graphql
query {
  matches_aggregate {
    aggregate {
      count
      avg {
        goals_for
      }
    }
  }
}
```

4. **Use Aliases** for multiple queries:
```graphql
query {
  homeMatches: matches(where: { venue: { _eq: "home" } }) {
    id
  }
  awayMatches: matches(where: { venue: { _eq: "away" } }) {
    id
  }
}
```

## Testing in Hasura Console

1. Open Hasura Console: http://localhost:8080/console
2. Go to **API** tab
3. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
4. Paste your query
5. Click **Run**

## Testing with cURL

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query { matches { id date } }"
  }'
```

## Testing with JavaScript

```javascript
const response = await fetch('http://localhost:8080/v1/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
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

const data = await response.json();
console.log(data);
```

