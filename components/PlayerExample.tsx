'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Example query matching the format from the requirements
const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    players_by_pk(id: $id) {
      id
      first_name
      last_name
      position
      player_statistics {
        goals
        assists
        rating
      }
    }
  }
`;

interface PlayerExampleProps {
  playerId: string;
}

export function PlayerExample({ playerId }: PlayerExampleProps) {
  const { data, loading, error } = useQuery(GET_PLAYER, {
    variables: { id: playerId },
  });

  if (loading) {
    return <div className="p-4">Loading player data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  const player = data?.players_by_pk;
  if (!player) {
    return <div className="p-4">Player not found</div>;
  }

  // Calculate aggregate stats
  const stats = player.player_statistics || [];
  const totalGoals = stats.reduce((sum: number, stat: any) => sum + (stat.goals || 0), 0);
  const totalAssists = stats.reduce((sum: number, stat: any) => sum + (stat.assists || 0), 0);
  const avgRating = stats.length > 0
    ? stats.reduce((sum: number, stat: any) => sum + (stat.rating || 0), 0) / stats.length
    : 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {player.first_name} {player.last_name}
      </h2>
      <div className="space-y-2 mb-4">
        <p className="text-gray-600">
          <span className="font-semibold">Position:</span> {player.position}
        </p>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Statistics:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Total Goals: {totalGoals}</li>
            <li>Total Assists: {totalAssists}</li>
            <li>Average Rating: {avgRating.toFixed(1)}</li>
          </ul>
        </div>
      </div>
      
      {/* Display individual match stats */}
      {stats.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Match Statistics:</h3>
          <div className="space-y-2">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="border p-2 rounded">
                <p className="text-sm">
                  Goals: {stat.goals || 0} | 
                  Assists: {stat.assists || 0} | 
                  Rating: {stat.rating || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

