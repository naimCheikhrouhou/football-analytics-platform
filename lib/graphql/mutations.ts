import { gql } from '@apollo/client';

// =====================================================
// Match Mutations
// =====================================================

export const CREATE_MATCH = gql`
  mutation CreateMatch($match: matches_insert_input!) {
    insert_matches_one(object: $match) {
      id
      date
      home_team
      away_team
      competition
    }
  }
`;

export const UPDATE_MATCH = gql`
  mutation UpdateMatch($id: uuid!, $updates: matches_set_input!) {
    update_matches_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
      goals_for
      goals_against
      date
    }
  }
`;

export const DELETE_MATCH = gql`
  mutation DeleteMatch($id: uuid!) {
    delete_matches_by_pk(id: $id) {
      id
    }
  }
`;

// =====================================================
// Player Mutations
// =====================================================

export const CREATE_PLAYER = gql`
  mutation CreatePlayer($player: players_insert_input!) {
    insert_players_one(object: $player) {
      id
      first_name
      last_name
      position
    }
  }
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($id: uuid!, $updates: players_set_input!) {
    update_players_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
      first_name
      last_name
      position
    }
  }
`;

// =====================================================
// Player Statistics Mutations
// =====================================================

export const CREATE_PLAYER_STATISTICS = gql`
  mutation CreatePlayerStatistics($stats: player_statistics_insert_input!) {
    insert_player_statistics_one(object: $stats) {
      id
      player_id
      match_id
      goals
      assists
      rating
    }
  }
`;

export const UPDATE_PLAYER_STATISTICS = gql`
  mutation UpdatePlayerStatistics(
    $id: uuid!
    $updates: player_statistics_set_input!
  ) {
    update_player_statistics_by_pk(
      pk_columns: { id: $id }
      _set: $updates
    ) {
      id
      goals
      assists
      rating
    }
  }
`;

// =====================================================
// Training Session Mutations
// =====================================================

export const CREATE_TRAINING_SESSION = gql`
  mutation CreateTrainingSession(
    $session: training_sessions_insert_input!
  ) {
    insert_training_sessions_one(object: $session) {
      id
      date
      type
      intensity
    }
  }
`;

// =====================================================
// PDF Report Mutations
// =====================================================

export const GENERATE_PDF_REPORT = gql`
  mutation GeneratePdfReport(
    $reportType: String!
    $entityId: uuid
    $options: jsonb
  ) {
    generatePdfReport(
      reportType: $reportType
      entityId: $entityId
      options: $options
    ) {
      report_id
      download_url
      status
      created_at
    }
  }
`;

