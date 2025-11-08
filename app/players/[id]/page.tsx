'use client';

import { use } from 'react';
import { PlayerStatsChart } from '@/components/PlayerStatsChart';

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <PlayerStatsChart playerId={id} />
      </div>
    </div>
  );
}

