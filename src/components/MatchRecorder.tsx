import { useState, useEffect } from 'react';
import { fetchPlayers, createMatch } from '../lib/api';
import { Trophy } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  team_id: string;
}

interface MatchRecorderProps {
  onMatchRecorded: () => void;
  refreshKey?: number;
}

export function MatchRecorder({ onMatchRecorded, refreshKey }: MatchRecorderProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayers();
  }, [refreshKey]);

  const loadPlayers = async () => {
    try {
      const data = await fetchPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Id || !player2Id || player1Id === player2Id) {
      setError('Please select two different players');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createMatch(player1Id, player2Id, player1Score, player2Score, new Date().toISOString());
      setPlayer1Id('');
      setPlayer2Id('');
      setPlayer1Score(0);
      setPlayer2Score(0);
      onMatchRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record match');
    }

    setLoading(false);
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Match</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="player1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Player 1
            </label>
            <select
              id="player1"
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="player2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Player 2
            </label>
            <select
              id="player2"
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="score1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getPlayerName(player1Id) || 'Player 1'} Score
            </label>
            <input
              type="number"
              id="score1"
              value={player1Score}
              onChange={(e) => setPlayer1Score(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-xl font-semibold"
              required
            />
          </div>

          <div>
            <label htmlFor="score2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getPlayerName(player2Id) || 'Player 2'} Score
            </label>
            <input
              type="number"
              id="score2"
              value={player2Score}
              onChange={(e) => setPlayer2Score(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-xl font-semibold"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : 'Record Match'}
        </button>
      </form>
    </div>
  );
}
