'use client';

import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '@/lib/graphql/queries';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  // Calculate statistics
  const totalGoals = data?.player_statistics_aggregate?.aggregate?.sum?.goals || 0;
  const totalMatches = data?.matches_aggregate?.aggregate?.count || 0;
  const allMatches = data?.all_matches || [];
  const wins = allMatches.filter((m: any) => 
    (m.goals_for || 0) > (m.goals_against || 0)
  ).length;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
  const featuredPlayer = data?.players?.[0];
  const recentMatches = data?.recent_matches || [];

  // Prepare chart data
  const matchResultsData = recentMatches.map((match: any) => ({
    date: new Date(match.date).toLocaleDateString(),
    goalsFor: match.goals_for || 0,
    goalsAgainst: match.goals_against || 0,
    result: match.goals_for > match.goals_against ? 'Win' : 
            match.goals_for < match.goals_against ? 'Loss' : 'Draw',
  }));

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Goals</h3>
            <p className="text-4xl font-bold">{totalGoals}</p>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Win Rate</h3>
            <p className="text-4xl font-bold">{winRate}%</p>
            <p className="text-sm mt-1">{wins} wins / {totalMatches} matches</p>
          </div>

          <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Matches</h3>
            <p className="text-4xl font-bold">{totalMatches}</p>
          </div>

          <div className="bg-orange-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Featured Player</h3>
            {featuredPlayer ? (
              <div>
                <p className="text-xl font-bold">
                  {featuredPlayer.first_name} {featuredPlayer.last_name}
                </p>
                <p className="text-sm mt-1">
                  {featuredPlayer.player_statistics_aggregate?.aggregate?.sum?.goals || 0} goals
                </p>
              </div>
            ) : (
              <p className="text-sm">No data</p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Matches Goals Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Recent Matches - Goals</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchResultsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goalsFor" fill="#82ca9d" name="Goals For" />
                <Bar dataKey="goalsAgainst" fill="#ff7300" name="Goals Against" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Match Results Trend */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Match Results Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={matchResultsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="goalsFor"
                  stroke="#8884d8"
                  name="Goals For"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="goalsAgainst"
                  stroke="#ff7300"
                  name="Goals Against"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Featured Player Details */}
        {featuredPlayer && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Player of the Week</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="text-xl font-semibold">
                  {featuredPlayer.first_name} {featuredPlayer.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Position</p>
                <p className="text-xl font-semibold">{featuredPlayer.position}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Goals</p>
                <p className="text-xl font-semibold">
                  {featuredPlayer.player_statistics_aggregate?.aggregate?.sum?.goals || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Average Rating</p>
                <p className="text-xl font-semibold">
                  {featuredPlayer.player_statistics_aggregate?.aggregate?.avg?.rating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Matches List */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {recentMatches.length > 0 ? (
              recentMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="border-b pb-4 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {match.home_team} vs {match.away_team}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(match.date).toLocaleDateString()} - {match.competition}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {match.goals_for || 0} - {match.goals_against || 0}
                    </p>
                    <p className={`text-sm ${
                      match.goals_for > match.goals_against ? 'text-green-600' :
                      match.goals_for < match.goals_against ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {match.goals_for > match.goals_against ? 'Win' :
                       match.goals_for < match.goals_against ? 'Loss' : 'Draw'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent matches</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

