'use client';

import { useQuery } from '@apollo/client';
import { GET_PLAYER_TRAINING_SESSIONS } from '@/lib/graphql/queries';

interface TrainingCycleVisualizationProps {
  playerId: string;
  startDate: string;
  endDate: string;
}

interface TrainingDay {
  date: Date;
  type: 'match' | 'training' | 'rest';
  label: string;
  daysBeforeMatch?: number;
  matchInfo?: {
    home_team: string;
    away_team: string;
  };
  trainingInfo?: {
    type: string;
    intensity: string;
  };
}

export function TrainingCycleVisualization({
  playerId,
  startDate,
  endDate,
}: TrainingCycleVisualizationProps) {
  const { data, loading, error } = useQuery(GET_PLAYER_TRAINING_SESSIONS, {
    variables: { playerId, startDate, endDate },
  });

  if (loading) return <div className="p-4">Loading training cycle...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const trainingSessions = data?.training_sessions || [];
  const matches = data?.matches || [];

  // Combine and sort all events by date
  const events: TrainingDay[] = [];

  // Add matches
  matches.forEach((match: any) => {
    events.push({
      date: new Date(match.date),
      type: 'match',
      label: `Match: ${match.home_team} vs ${match.away_team}`,
      matchInfo: {
        home_team: match.home_team,
        away_team: match.away_team,
      },
    });
  });

  // Add training sessions
  trainingSessions.forEach((session: any) => {
    if (session.attendance?.[0]?.attended) {
      events.push({
        date: new Date(session.date),
        type: 'training',
        label: `Training: ${session.type || 'Session'}`,
        trainingInfo: {
          type: session.type,
          intensity: session.intensity,
        },
      });
    }
  });

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate J-x days (days before next match)
  const timeline: TrainingDay[] = [];
  let currentMatchIndex = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (event.type === 'match') {
      // Find next match
      const nextMatchIndex = matches.findIndex(
        (m: any) => new Date(m.date) > event.date
      );

      if (nextMatchIndex !== -1) {
        const nextMatchDate = new Date(matches[nextMatchIndex].date);
        const daysUntilNext = Math.floor(
          (nextMatchDate.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24)
        );

        timeline.push({
          ...event,
          daysBeforeMatch: 0, // Match day
        });

        // Add training days with J-x labels
        for (let j = i + 1; j < events.length; j++) {
          const nextEvent = events[j];
          if (nextEvent.type === 'match') break;

          const daysFromMatch = Math.floor(
            (nextEvent.date.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24)
          );
          const daysBeforeNext = daysUntilNext - daysFromMatch;

          timeline.push({
            ...nextEvent,
            daysBeforeMatch: daysBeforeNext > 0 ? daysBeforeNext : undefined,
          });
        }
      } else {
        // Last match, no next match
        timeline.push({
          ...event,
          daysBeforeMatch: 0,
        });
      }
    }
  }

  // If no matches, just show all events
  if (matches.length === 0) {
    events.forEach((event) => timeline.push(event));
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Training Cycle Visualization</h2>

      <div className="space-y-4">
        {timeline.length > 0 ? (
          timeline.map((day, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded ${
                day.type === 'match'
                  ? 'border-red-500 bg-red-50'
                  : day.type === 'training'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {day.date.toLocaleDateString()}
                    </span>
                    {day.daysBeforeMatch !== undefined && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-semibold">
                        J-{day.daysBeforeMatch}
                      </span>
                    )}
                    {day.type === 'match' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
                        Match Day
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{day.label}</p>
                  {day.matchInfo && (
                    <p className="text-sm text-gray-600 mt-1">
                      {day.matchInfo.home_team} vs {day.matchInfo.away_team}
                    </p>
                  )}
                  {day.trainingInfo && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Type: {day.trainingInfo.type}</span>
                      {day.trainingInfo.intensity && (
                        <span className="ml-4">Intensity: {day.trainingInfo.intensity}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-8">
            No training sessions or matches found in this period
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Match Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Training Session</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">J-X</span>
            <span>Days before next match</span>
          </div>
        </div>
      </div>
    </div>
  );
}

