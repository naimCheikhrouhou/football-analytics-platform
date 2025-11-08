'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GENERATE_PDF_REPORT } from '@/lib/graphql/mutations';
import { GET_PLAYERS, GET_MATCHES } from '@/lib/graphql/queries';
import { useQuery } from '@apollo/client';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'player' | 'match' | 'comparison'>('player');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [reportOptions, setReportOptions] = useState<any>({});
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { data: playersData } = useQuery(GET_PLAYERS);
  const { data: matchesData } = useQuery(GET_MATCHES, { variables: { limit: 100 } });

  const [generateReport, { loading, error }] = useMutation(GENERATE_PDF_REPORT, {
    onCompleted: (data) => {
      setGeneratedReport(data.generatePdfReport);
    },
    onError: (err) => {
      console.error('Error generating report:', err);
    },
  });

  const handleGenerateReport = async () => {
    try {
      await generateReport({
        variables: {
          reportType: reportType,
          entityId: selectedEntityId || null,
          options: reportOptions,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const players = playersData?.players || [];
  const matches = matchesData?.matches || [];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PDF Reports</h1>

        {/* Report Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">Generate Report</h2>

          {/* Report Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as any);
                setSelectedEntityId('');
                setReportOptions({});
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="player">Player Performance Report</option>
              <option value="match">Match Report</option>
              <option value="comparison">Comparison Report</option>
            </select>
          </div>

          {/* Entity Selection */}
          {reportType === 'player' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Player</label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a player...</option>
                {players.map((player: any) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'match' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Match</label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a match...</option>
                {matches.map((match: any) => (
                  <option key={match.id} value={match.id}>
                    {match.home_team} vs {match.away_team} - {new Date(match.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'comparison' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Players (comma-separated IDs)</label>
              <input
                type="text"
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                placeholder="Enter player IDs separated by commas"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: player-id-1, player-id-2, player-id-3
              </p>
            </div>
          )}

          {/* Report Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Report Options</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportOptions.includeCharts || false}
                  onChange={(e) =>
                    setReportOptions({ ...reportOptions, includeCharts: e.target.checked })
                  }
                  className="mr-2"
                />
                Include Charts
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportOptions.includeTrainingData || false}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeTrainingData: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Include Training Data
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportOptions.includeDetailedStats || false}
                  onChange={(e) =>
                    setReportOptions({
                      ...reportOptions,
                      includeDetailedStats: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Include Detailed Statistics
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading || (reportType !== 'comparison' && !selectedEntityId)}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Report...' : 'Generate PDF Report'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              Error: {error.message}
            </div>
          )}
        </div>

        {/* Generated Report Display */}
        {generatedReport && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Report Generated</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Report ID:</p>
                <p className="font-semibold">{generatedReport.report_id}</p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-semibold">{generatedReport.status}</p>
              </div>
              {generatedReport.download_url && (
                <div>
                  <a
                    href={generatedReport.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Download PDF Report
                  </a>
                </div>
              )}
              <div>
                <p className="text-gray-600">Created At:</p>
                <p className="font-semibold">
                  {new Date(generatedReport.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-lg mt-6">
          <h3 className="text-lg font-semibold mb-2">Report Types</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <strong>Player Performance Report:</strong> Detailed statistics, match history,
              and training log for a specific player
            </li>
            <li>
              <strong>Match Report:</strong> Comprehensive summary of a single match with team
              and player statistics
            </li>
            <li>
              <strong>Comparison Report:</strong> Side-by-side comparison of multiple players
              or teams with visualizations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

