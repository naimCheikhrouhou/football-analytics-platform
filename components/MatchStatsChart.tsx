'use client';

import { useQuery } from '@apollo/client';
import { GET_MATCHES } from '@/lib/graphql/queries';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function MatchStatsChart() {
  const { data, loading, error } = useQuery(GET_MATCHES, {
    variables: { limit: 10 },
  });

  if (loading) return <div className="p-4">Loading match statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.matches) return <div className="p-4">No matches found</div>;

  const matches = data.matches;

  // Prepare data for charts
  const matchData = matches.map((match: any) => ({
    date: new Date(match.date).toLocaleDateString(),
    match: `${match.home_team} vs ${match.away_team}`,
    goalsFor: match.goals_for || 0,
    goalsAgainst: match.goals_against || 0,
    goalDifference: (match.goals_for || 0) - (match.goals_against || 0),
  }));

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Match Statistics</h2>

      {/* Goals For/Against Bar Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Goals For vs Goals Against</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={matchData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="match" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="goalsFor" fill="#82ca9d" name="Goals For" />
            <Bar dataKey="goalsAgainst" fill="#ff7300" name="Goals Against" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Difference Line Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Goal Difference Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={matchData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="goalDifference"
              stroke="#8884d8"
              name="Goal Difference"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

