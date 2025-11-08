import { gql } from '@apollo/client';

// =====================================================
// User Profile Queries
// =====================================================

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    user_profiles(where: { id: { _eq: "X-Hasura-User-Id" } }) {
      id
      role
      full_name
      created_at
      updated_at
    }
  }
`;

export const GET_ALL_PROFILES = gql`
  query GetAllProfiles {
    user_profiles {
      id
      role
      full_name
      created_at
    }
  }
`;

// =====================================================
// Player Queries
// =====================================================

export const GET_PLAYER = gql`
  query GetPlayer($id: uuid!) {
    players_by_pk(id: $id) {
      id
      first_name
      last_name
      position
      jersey_number
      date_of_birth
      height
      weight
      created_at
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers {
    players(order_by: { last_name: asc }) {
      id
      first_name
      last_name
      position
      jersey_number
    }
  }
`;

export const GET_PLAYER_WITH_STATS = gql`
  query GetPlayerWithStats($playerId: uuid!) {
    players_by_pk(id: $playerId) {
      id
      first_name
      last_name
      position
      jersey_number
      player_statistics {
        id
        match {
          id
          date
          home_team
          away_team
        }
        goals
        assists
        rating
        minutes_played
      }
    }
  }
`;

export const GET_PLAYER_PERFORMANCE = gql`
  query GetPlayerPerformance($playerId: uuid!) {
    players_by_pk(id: $playerId) {
      id
      first_name
      last_name
      position
      # These would be computed fields if configured
      player_statistics_aggregate {
        aggregate {
          count
          sum {
            goals
            assists
          }
          avg {
            rating
          }
        }
      }
    }
  }
`;

// =====================================================
// Match Queries
// =====================================================

export const GET_MATCHES = gql`
  query GetMatches($limit: Int, $offset: Int) {
    matches(
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
      competition
      venue
    }
    matches_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const GET_MATCH = gql`
  query GetMatch($id: uuid!) {
    matches_by_pk(id: $id) {
      id
      date
      home_team
      away_team
      goals_for
      goals_against
      competition
      venue
      player_statistics {
        player {
          id
          first_name
          last_name
          position
        }
        goals
        assists
        rating
        minutes_played
      }
    }
  }
`;

// =====================================================
// Training Session Queries
// =====================================================

export const GET_TRAINING_SESSIONS = gql`
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
`;

// =====================================================
// Analytics Queries (Custom Actions)
// =====================================================

export const GET_PLAYER_ANALYTICS = gql`
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
`;

export const GET_TRAINING_CYCLE_ANALYSIS = gql`
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
`;

// =====================================================
// Dashboard Aggregate Queries
// =====================================================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    # Total Goals
    player_statistics_aggregate {
      aggregate {
        sum {
          goals
        }
      }
    }
    
    # Win Rate - get all matches (calculate wins client-side)
    matches_aggregate {
      aggregate {
        count
      }
    }
    all_matches: matches {
      id
      goals_for
      goals_against
    }
    
    # Featured Player (top scorer)
    players(
      order_by: { player_statistics_aggregate: { sum: { goals: desc } } }
      limit: 1
    ) {
      id
      first_name
      last_name
      position
      player_statistics_aggregate {
        aggregate {
          sum {
            goals
            assists
          }
          avg {
            rating
          }
        }
      }
    }
    
    # Recent Matches
    recent_matches: matches(order_by: { date: desc }, limit: 5) {
      id
      date
      home_team
      away_team
      goals_for
      goals_against
      competition
    }
  }
`;

export const GET_FILTERED_MATCHES = gql`
  query GetFilteredMatches(
    $competition: String
    $startDate: date
    $endDate: date
    $venue: String
    $result: String
    $limit: Int
    $offset: Int
  ) {
    matches(
      where: {
        competition: { _eq: $competition }
        date: { _gte: $startDate, _lte: $endDate }
        venue: { _eq: $venue }
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
      competition
      venue
    }
    matches_aggregate(
      where: {
        competition: { _eq: $competition }
        date: { _gte: $startDate, _lte: $endDate }
        venue: { _eq: $venue }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_PLAYER_TRAINING_SESSIONS = gql`
  query GetPlayerTrainingSessions($playerId: uuid!, $startDate: date!, $endDate: date!) {
    training_sessions(
      where: {
        date: { _gte: $startDate, _lte: $endDate }
        attendance: { player_id: { _eq: $playerId } }
      }
      order_by: { date: asc }
    ) {
      id
      date
      type
      intensity
      duration
      attendance(where: { player_id: { _eq: $playerId } }) {
        attended
      }
    }
    matches(
      where: {
        date: { _gte: $startDate, _lte: $endDate }
        player_statistics: { player_id: { _eq: $playerId } }
      }
      order_by: { date: asc }
    ) {
      id
      date
      home_team
      away_team
    }
  }
`;

export const GET_COMPARISON_DATA = gql`
  query GetComparisonData($playerIds: [uuid!]!) {
    players(where: { id: { _in: $playerIds } }) {
      id
      first_name
      last_name
      position
      player_statistics_aggregate {
        aggregate {
          sum {
            goals
            assists
          }
          avg {
            rating
          }
          count
        }
      }
      player_statistics {
        goals
        assists
        rating
      }
    }
  }
`;

