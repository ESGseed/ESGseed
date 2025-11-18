'use client';

import { useEffect, useState } from 'react';
import { soccerApi } from '@/lib/api';

interface Player {
  playerId: number;
  playerName: string;
  position: string;
  teamUk: string;
  backNo: string;
  nation?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export default function SoccerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchPosition, setSearchPosition] = useState('');

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await soccerApi.getPlayers(
        searchName || undefined,
        searchPosition || undefined
      ) as ApiResponse<Player[]>;
      setPlayers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 로드 시에만 실행

  const handleSearch = () => {
    fetchPlayers();
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Soccer Players</h1>
      
      {/* Search Section */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Search by position..."
          value={searchPosition}
          onChange={(e) => setSearchPosition(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.playerId}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{player.playerName}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Position: {player.position}</p>
              <p>Team: {player.teamUk}</p>
              <p>Back No: {player.backNo}</p>
              {player.nation && <p>Nation: {player.nation}</p>}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No players found
        </div>
      )}
    </div>
  );
}

