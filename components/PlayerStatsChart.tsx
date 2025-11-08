'use client';

import { useQuery } from '@apollo/client';
import { GET_PLAYER_WITH_STATS } from '@/lib/graphql/queries';
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

interface PlayerStatsChartProps {
  playerId: string;
}

export function PlayerStatsChart({ playerId }: PlayerStatsChartProps) {
  const { data, loading, error } = useQuery(GET_PLAYER_WITH_STATS, {
    variables: { playerId },
  });

  if (loading) return <div className="p-4">Loading player statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.players_by_pk) return <div className="p-4">Player not found</div>;

  const player = data.players_by_pk;
  const stats = player.player_statistics || [];

  // Prepare data for charts
  const performanceData = stats.map((stat: any) => ({
    date: new Date(stat.match.date).toLocaleDateString(),
    rating: stat.rating || 0,
    goals: stat.goals || 0,
    assists: stat.assists || 0,
  }));

  const goalsData = stats.map((stat: any) => ({
    date: new Date(stat.match.date).toLocaleDateString(),
    goals: stat.goals || 0,
  }));

  // Calculate totals
  const totalGoals = stats.reduce((sum: number, stat: any) => sum + (stat.goals || 0), 0);
  const totalAssists = stats.reduce((sum: number, stat: any) => sum + (stat.assists || 0), 0);
  const avgRating = stats.length > 0
    ? stats.reduce((sum: number, stat: any) => sum + (stat.rating || 0), 0) / stats.length
    : 0;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          {player.first_name} {player.last_name} - Performance Analytics
        </h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Goals</p>
            <p className="text-3xl font-bold text-blue-600">{totalGoals}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Assists</p>
            <p className="text-3xl font-bold text-green-600">{totalAssists}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-3xl font-bold text-purple-600">
              {avgRating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Performance Trend Line Chart */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#8884d8"
                name="Rating"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="goals"
                stroke="#82ca9d"
                name="Goals"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="assists"
                stroke="#ffc658"
                name="Assists"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Bar Chart */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Goals per Match</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="goals" fill="#8884d8" name="Goals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

