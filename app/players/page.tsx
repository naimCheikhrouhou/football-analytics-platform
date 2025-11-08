'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS, GET_PLAYER_WITH_STATS } from '@/lib/graphql/queries';
import Link from 'next/link';
import { PlayerStatsChart } from '@/components/PlayerStatsChart';
import { TrainingCycleVisualization } from '@/components/TrainingCycleVisualization';

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');

  const { data, loading, error } = useQuery(GET_PLAYERS);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl">Loading players...</div>
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

  const players = data?.players || [];
  const filteredPlayers = players.filter((player: any) =>
    `${player.first_name} ${player.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'profile' && selectedPlayerId) {
    return (
      <PlayerProfileView
        playerId={selectedPlayerId}
        onBack={() => {
          setViewMode('list');
          setSelectedPlayerId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Players</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player: any) => (
            <div
              key={player.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedPlayerId(player.id);
                setViewMode('profile');
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {player.first_name[0]}{player.last_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-gray-600">{player.position}</p>
                  {player.jersey_number && (
                    <p className="text-sm text-gray-500">#{player.jersey_number}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No players found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerProfileView({
  playerId,
  onBack,
}: {
  playerId: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'stats' | 'training'>('stats');
  const [trainingStartDate, setTrainingStartDate] = useState(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [trainingEndDate, setTrainingEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ← Back to Players
        </button>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'training'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Training Cycle
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'stats' && <PlayerStatsChart playerId={playerId} />}

        {activeTab === 'training' && (
          <div>
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={trainingStartDate}
                    onChange={(e) => setTrainingStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={trainingEndDate}
                    onChange={(e) => setTrainingEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
            <TrainingCycleVisualization
              playerId={playerId}
              startDate={trainingStartDate}
              endDate={trainingEndDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

