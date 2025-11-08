'use client';

import { useQuery } from '@apollo/client';
import { GET_PLAYERS } from '@/lib/graphql/queries';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlayerComparisonChartProps {
  playerIds: string[];
}

export function PlayerComparisonChart({ playerIds }: PlayerComparisonChartProps) {
  const { data, loading, error } = useQuery(GET_PLAYERS);

  if (loading) return <div className="p-4">Loading players...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.players) return <div className="p-4">No players found</div>;

  // Filter selected players and prepare data
  const selectedPlayers = data.players.filter((p: any) => playerIds.includes(p.id));

  // Prepare radar chart data (example metrics)
  // In a real app, you'd fetch actual statistics
  const radarData = selectedPlayers.map((player: any) => ({
    subject: `${player.first_name} ${player.last_name}`,
    goals: Math.floor(Math.random() * 20) + 5, // Replace with actual data
    assists: Math.floor(Math.random() * 15) + 3,
    rating: Math.floor(Math.random() * 30) + 70,
    speed: Math.floor(Math.random() * 20) + 60,
    defense: Math.floor(Math.random() * 20) + 50,
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Player Comparison</h2>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          {selectedPlayers.map((player: any, index: number) => (
            <Radar
              key={player.id}
              name={`${player.first_name} ${player.last_name}`}
              dataKey={player.id}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

