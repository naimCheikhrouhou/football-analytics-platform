'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FILTERED_MATCHES, GET_MATCH } from '@/lib/graphql/queries';
import Link from 'next/link';

export default function MatchesPage() {
  const [filters, setFilters] = useState({
    competition: '',
    startDate: '',
    endDate: '',
    venue: '',
    result: '',
  });
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const { data, loading, error, refetch } = useQuery(GET_FILTERED_MATCHES, {
    variables: {
      competition: filters.competition || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      venue: filters.venue || undefined,
      limit: itemsPerPage,
      offset: page * itemsPerPage,
    },
  });

  const { data: matchDetails, loading: matchLoading } = useQuery(GET_MATCH, {
    variables: { id: selectedMatchId },
    skip: !selectedMatchId,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      competition: '',
      startDate: '',
      endDate: '',
      venue: '',
      result: '',
    });
    setPage(0);
  };

  const matches = data?.matches || [];
  const totalCount = data?.matches_aggregate?.aggregate?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Matches</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Competition</label>
              <input
                type="text"
                value={filters.competition}
                onChange={(e) => handleFilterChange('competition', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter competition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <select
                value={filters.venue}
                onChange={(e) => handleFilterChange('venue', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All</option>
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Result</label>
              <select
                value={filters.result}
                onChange={(e) => handleFilterChange('result', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Match List ({totalCount} total)
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading matches...</div>
          ) : error ? (
            <div className="text-red-500 py-8">Error: {error.message}</div>
          ) : matches.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">No matches found</div>
          ) : (
            <div className="space-y-4">
              {matches.map((match: any) => {
                const isWin = match.goals_for > match.goals_against;
                const isLoss = match.goals_for < match.goals_against;
                const isDraw = match.goals_for === match.goals_against;

                return (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(match.date).toLocaleDateString()} - {match.competition}
                          {match.venue && ` - ${match.venue}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {match.goals_for || 0} - {match.goals_against || 0}
                        </p>
                        <p className={`text-sm font-semibold ${
                          isWin ? 'text-green-600' :
                          isLoss ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {isWin ? 'Win' : isLoss ? 'Loss' : 'Draw'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Match Details Modal/Section */}
        {selectedMatchId && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Match Details</h2>
              <button
                onClick={() => setSelectedMatchId(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            {matchLoading ? (
              <div className="text-center py-8">Loading match details...</div>
            ) : matchDetails?.matches_by_pk ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Match Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-semibold">
                        {new Date(matchDetails.matches_by_pk.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Competition</p>
                      <p className="font-semibold">{matchDetails.matches_by_pk.competition}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Venue</p>
                      <p className="font-semibold">{matchDetails.matches_by_pk.venue || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Score</p>
                      <p className="font-semibold text-2xl">
                        {matchDetails.matches_by_pk.goals_for || 0} - {matchDetails.matches_by_pk.goals_against || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Player Statistics</h3>
                  {matchDetails.matches_by_pk.player_statistics?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Player</th>
                            <th className="border p-2 text-center">Position</th>
                            <th className="border p-2 text-center">Goals</th>
                            <th className="border p-2 text-center">Assists</th>
                            <th className="border p-2 text-center">Rating</th>
                            <th className="border p-2 text-center">Minutes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchDetails.matches_by_pk.player_statistics.map((stat: any) => (
                            <tr key={stat.player.id}>
                              <td className="border p-2">
                                {stat.player.first_name} {stat.player.last_name}
                              </td>
                              <td className="border p-2 text-center">{stat.player.position}</td>
                              <td className="border p-2 text-center">{stat.goals || 0}</td>
                              <td className="border p-2 text-center">{stat.assists || 0}</td>
                              <td className="border p-2 text-center">{stat.rating || 'N/A'}</td>
                              <td className="border p-2 text-center">{stat.minutes_played || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No player statistics available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-red-500">Match not found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

