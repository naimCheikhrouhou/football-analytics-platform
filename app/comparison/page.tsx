'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS, GET_COMPARISON_DATA } from '@/lib/graphql/queries';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function ComparisonPage() {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<'players' | 'teams'>('players');

  const { data: playersData, loading: playersLoading } = useQuery(GET_PLAYERS);
  const { data: comparisonData, loading: comparisonLoading } = useQuery(
    GET_COMPARISON_DATA,
    {
      variables: { playerIds: selectedPlayerIds },
      skip: selectedPlayerIds.length === 0,
    }
  );

  const players = playersData?.players || [];
  const comparisonPlayers = comparisonData?.players || [];

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Prepare radar chart data
  const radarData = comparisonPlayers.map((player: any) => {
    const stats = player.player_statistics_aggregate?.aggregate || {};
    const totalGoals = stats.sum?.goals || 0;
    const totalAssists = stats.sum?.assists || 0;
    const avgRating = stats.avg?.rating || 0;
    const matchCount = stats.count || 0;

    // Normalize values for radar chart (0-100 scale)
    return {
      subject: `${player.first_name} ${player.last_name}`,
      goals: Math.min((totalGoals / 20) * 100, 100),
      assists: Math.min((totalAssists / 15) * 100, 100),
      rating: avgRating,
      matches: Math.min((matchCount / 30) * 100, 100),
      consistency: avgRating > 0 ? Math.min(avgRating, 100) : 0,
    };
  });

  // Prepare bar chart data
  const barChartData = comparisonPlayers.map((player: any) => {
    const stats = player.player_statistics_aggregate?.aggregate || {};
    return {
      name: `${player.first_name} ${player.last_name}`,
      goals: stats.sum?.goals || 0,
      assists: stats.sum?.assists || 0,
      avgRating: stats.avg?.rating?.toFixed(1) || 0,
      matches: stats.count || 0,
    };
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Comparison Tools</h1>

        {/* Player Selection */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Players to Compare</h2>
          {playersLoading ? (
            <div className="text-center py-4">Loading players...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {players.map((player: any) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerToggle(player.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlayerIds.includes(player.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <p className="font-semibold">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{player.position}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Charts */}
        {selectedPlayerIds.length > 0 && (
          <div className="space-y-6">
            {/* Radar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Multi-Dimensional Comparison</h2>
              {comparisonLoading ? (
                <div className="text-center py-8">Loading comparison data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {comparisonPlayers.map((player: any, index: number) => (
                      <Radar
                        key={player.id}
                        name={`${player.first_name} ${player.last_name}`}
                        dataKey={`${player.first_name} ${player.last_name}`}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.6}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goals & Assists */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Goals & Assists</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="goals" fill="#8884d8" name="Goals" />
                    <Bar dataKey="assists" fill="#82ca9d" name="Assists" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Average Rating & Matches */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Rating & Matches</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgRating" fill="#ffc658" name="Avg Rating" />
                    <Bar dataKey="matches" fill="#ff7300" name="Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Detailed Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Player</th>
                      <th className="border p-2 text-center">Position</th>
                      <th className="border p-2 text-center">Goals</th>
                      <th className="border p-2 text-center">Assists</th>
                      <th className="border p-2 text-center">Avg Rating</th>
                      <th className="border p-2 text-center">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonPlayers.map((player: any) => {
                      const stats = player.player_statistics_aggregate?.aggregate || {};
                      return (
                        <tr key={player.id}>
                          <td className="border p-2 font-semibold">
                            {player.first_name} {player.last_name}
                          </td>
                          <td className="border p-2 text-center">{player.position}</td>
                          <td className="border p-2 text-center">
                            {stats.sum?.goals || 0}
                          </td>
                          <td className="border p-2 text-center">
                            {stats.sum?.assists || 0}
                          </td>
                          <td className="border p-2 text-center">
                            {stats.avg?.rating?.toFixed(1) || 'N/A'}
                          </td>
                          <td className="border p-2 text-center">
                            {stats.count || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedPlayerIds.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-lg text-center">
            <p className="text-gray-500 text-lg">
              Select at least one player to start comparing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

