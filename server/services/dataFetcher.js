const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fetch player data for PDF report
 */
async function getPlayerData(playerId) {
  try {
    // Fetch player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError) throw playerError;
    if (!player) throw new Error('Player not found');

    // Fetch player statistics with aggregates
    const { data: stats, error: statsError } = await supabase
      .from('player_statistics')
      .select(`
        *,
        match:matches(*)
      `)
      .eq('player_id', playerId);

    if (statsError) throw statsError;

    // Calculate aggregates
    const totalGoals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const totalAssists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const avgRating = stats.length > 0
      ? stats.reduce((sum, s) => sum + (s.rating || 0), 0) / stats.length
      : 0;

    return {
      ...player,
      player_statistics: stats,
      player_statistics_aggregate: {
        aggregate: {
          sum: { goals: totalGoals, assists: totalAssists },
          avg: { rating: avgRating },
          count: stats.length,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error;
  }
}

/**
 * Fetch match data for PDF report
 */
async function getMatchData(matchId) {
  try {
    // Fetch match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;
    if (!match) throw new Error('Match not found');

    // Fetch player statistics for this match
    const { data: stats, error: statsError } = await supabase
      .from('player_statistics')
      .select(`
        *,
        player:players(*)
      `)
      .eq('match_id', matchId);

    if (statsError) throw statsError;

    return {
      ...match,
      player_statistics: stats || [],
    };
  } catch (error) {
    console.error('Error fetching match data:', error);
    throw error;
  }
}

/**
 * Fetch comparison data for multiple players
 */
async function getComparisonData(playerIds) {
  try {
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .in('id', playerIds);

    if (playersError) throw playersError;
    if (!players || players.length === 0) {
      throw new Error('No players found');
    }

    // Fetch statistics for all players
    const { data: allStats, error: statsError } = await supabase
      .from('player_statistics')
      .select('*')
      .in('player_id', playerIds);

    if (statsError) throw statsError;

    // Calculate aggregates for each player
    const playersWithStats = players.map((player) => {
      const playerStats = allStats.filter(s => s.player_id === player.id);
      const totalGoals = playerStats.reduce((sum, s) => sum + (s.goals || 0), 0);
      const totalAssists = playerStats.reduce((sum, s) => sum + (s.assists || 0), 0);
      const avgRating = playerStats.length > 0
        ? playerStats.reduce((sum, s) => sum + (s.rating || 0), 0) / playerStats.length
        : 0;

      return {
        ...player,
        player_statistics: playerStats,
        player_statistics_aggregate: {
          aggregate: {
            sum: { goals: totalGoals, assists: totalAssists },
            avg: { rating: avgRating },
            count: playerStats.length,
          },
        },
      };
    });

    return playersWithStats;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
}

module.exports = { getPlayerData, getMatchData, getComparisonData };

