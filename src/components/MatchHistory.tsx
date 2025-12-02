import { useEffect, useState } from 'react';
import { fetchMatches, fetchPlayers } from '../lib/api';
import { History } from 'lucide-react';

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  match_date: string;
}

interface Player {
  id: string;
  name: string;
  team_id: string;
}

export function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesData, playersData] = await Promise.all([
        fetchMatches(),
        fetchPlayers()
      ]);

      setMatches(matchesData.slice(0, 10));
      const playersMap = new Map(playersData.map((p: Player) => [p.id, p]));
      setPlayers(playersMap);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Matches</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No matches recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Matches</h2>
      </div>

      <div className="space-y-3">
        {matches.map((match) => {
          const player1 = players.get(match.player1_id);
          const player2 = players.get(match.player2_id);

          if (!player1 || !player2) return null;

          const isPlayer1Winner = match.player1_score > match.player2_score;
          const isPlayer2Winner = match.player2_score > match.player1_score;
          const isDraw = match.player1_score === match.player2_score;

          return (
            <div
              key={match.id}
              className="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${isPlayer1Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {player1.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-sm font-medium ${isPlayer2Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {player2.name}
                    </span>
                  </div>
                </div>

                <div className="text-center px-6">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xl font-bold ${isPlayer1Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {match.player1_score}
                    </span>
                    <span className={`text-xl font-bold ${isPlayer2Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {match.player2_score}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  {isDraw && (
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                      Draw
                    </span>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formatDate(match.match_date)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
