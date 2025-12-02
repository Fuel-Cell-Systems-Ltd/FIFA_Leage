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
  disabled?: boolean;
}

export function MatchRecorder({ onMatchRecorded, refreshKey, disabled = false }: MatchRecorderProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
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
    if (disabled) return;
    if (!player1Id || !player2Id || player1Id === player2Id) {
      setError('Please select two different players');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const p1 = player1Score === '' ? 0 : Number(player1Score);
      const p2 = player2Score === '' ? 0 : Number(player2Score);
      await createMatch(player1Id, player2Id, p1, p2, new Date().toISOString());
      setPlayer1Id('');
      setPlayer2Id('');
      setPlayer1Score('');
      setPlayer2Score('');
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
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
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
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^[0-9]+$/.test(val)) {
                setPlayer1Score(val);
              }
            }}
            min="0"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            inputMode="numeric"
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^[0-9]+$/.test(val)) {
                setPlayer2Score(val);
              }
            }}
            min="0"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            inputMode="numeric"
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
          disabled={loading || disabled}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : 'Record Match'}
        </button>
        {disabled && (
          <p className="text-xs text-center text-amber-600 dark:text-amber-400">
            Enter the passkey in the top bar to unlock match recording.
          </p>
        )}
      </form>
    </div>
  );
}
