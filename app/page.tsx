'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Football Analytics Platform</h1>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard">
            <div className="bg-blue-500 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
              <p className="text-blue-100">
                Overview of key performance indicators, recent matches, and featured player
              </p>
            </div>
          </Link>

          <Link href="/matches">
            <div className="bg-green-500 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">Matches</h2>
              <p className="text-green-100">
                View all matches with filtering options and detailed statistics
              </p>
            </div>
          </Link>

          <Link href="/players">
            <div className="bg-purple-500 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">Players</h2>
              <p className="text-purple-100">
                Browse player profiles, statistics, and training cycle visualizations
              </p>
            </div>
          </Link>

          <Link href="/comparison">
            <div className="bg-orange-500 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">Comparison Tools</h2>
              <p className="text-orange-100">
                Compare multiple players or teams using radar and bar charts
              </p>
            </div>
          </Link>

          <Link href="/reports">
            <div className="bg-red-500 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">PDF Reports</h2>
              <p className="text-red-100">
                Generate and download detailed PDF reports for players, matches, or comparisons
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Info */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Football Analytics Platform</h2>
          <p className="text-gray-700 mb-4">
            This platform provides comprehensive analytics for football teams, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Match performance tracking and statistics</li>
            <li>Player performance analytics with visualizations</li>
            <li>Training cycle analysis with J-x day calculations</li>
            <li>Player and team comparison tools</li>
            <li>PDF report generation for offline analysis</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

