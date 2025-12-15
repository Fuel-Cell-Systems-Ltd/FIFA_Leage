import { useEffect, useMemo, useState } from 'react';
import { ListChecks, PlayCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchMatches, fetchPlayers } from '../lib/api';

const PLAYED_PAGE_SIZE = 6;

interface Player {
  id: string;
  name: string;
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  match_date: string;
}

interface Pairing {
  key: string;
  player1: Player;
  player2: Player;
}

interface PlayedGame {
  key: string;
  match: Match;
  player1: Player;
  player2: Player;
  duplicateCount: number;
}

interface FeaturesOverviewProps {
  refreshKey?: number;
}

export function FeaturesOverview({ refreshKey }: FeaturesOverviewProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playedPage, setPlayedPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [playersData, matchesData] = await Promise.all([
        fetchPlayers(),
        fetchMatches()
      ]);
      setPlayers(playersData);
      setMatches(matchesData);
      setPlayedPage(1);
    } catch (err) {
      console.error('Failed to load feature data', err);
      setError('Unable to load latest player/match data.');
    } finally {
      setLoading(false);
    }
  };

  const playersMap = useMemo(() => {
    return new Map(players.map((player) => [player.id, player]));
  }, [players]);

  const allPairings: Pairing[] = useMemo(() => {
    const list: Pairing[] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const key = [p1.id, p2.id].sort().join('-');
        list.push({
          key,
          player1: p1,
          player2: p2
        });
      }
    }
    return list;
  }, [players]);

  const matchesByPair = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of matches) {
      const [first, second] = [match.player1_id, match.player2_id].sort();
      const key = `${first}-${second}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(match);
    }
    return map;
  }, [matches]);

  const gamesLeft: Pairing[] = useMemo(() => {
    return allPairings
      .filter((pair) => !matchesByPair.has(pair.key))
      .sort((a, b) => {
        const aName = `${a.player1.name}${a.player2.name}`;
        const bName = `${b.player1.name}${b.player2.name}`;
        return aName.localeCompare(bName);
      });
  }, [allPairings, matchesByPair]);

  const gamesPlayed: PlayedGame[] = useMemo(() => {
    const rows: PlayedGame[] = [];
    for (const [key, matchList] of matchesByPair.entries()) {
      const sortedMatches = matchList
        .slice()
        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
      const latest = sortedMatches[0];
      const player1 = playersMap.get(latest.player1_id);
      const player2 = playersMap.get(latest.player2_id);
      if (!player1 || !player2) continue;
      rows.push({
        key,
        match: latest,
        player1,
        player2,
        duplicateCount: matchList.length
      });
    }
    return rows.sort(
      (a, b) => new Date(b.match.match_date).getTime() - new Date(a.match.match_date).getTime()
    );
  }, [matchesByPair, playersMap]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(gamesPlayed.length / PLAYED_PAGE_SIZE));
    setPlayedPage(prev => Math.min(prev, totalPages));
  }, [gamesPlayed.length]);

  const playedTotalPages = Math.max(1, Math.ceil(gamesPlayed.length / PLAYED_PAGE_SIZE));
  const paginatedGamesPlayed = useMemo(() => {
    const start = (playedPage - 1) * PLAYED_PAGE_SIZE;
    return gamesPlayed.slice(start, start + PLAYED_PAGE_SIZE);
  }, [gamesPlayed, playedPage]);
  const playedShowingFrom =
    gamesPlayed.length === 0 ? 0 : (playedPage - 1) * PLAYED_PAGE_SIZE + 1;
  const playedShowingTo = Math.min(gamesPlayed.length, playedPage * PLAYED_PAGE_SIZE);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span>Loading features...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/40 dark:border-red-800 dark:text-red-100">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <PlayCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Games left to be played</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {gamesLeft.length} remaining of {allPairings.length}
          </span>
        </div>
        {players.length < 2 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Add at least two players to generate the required fixtures.
          </p>
        ) : gamesLeft.length === 0 ? (
          <p className="text-green-600 dark:text-green-400 text-sm">
            All possible match-ups have been played. Great job!
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-lg">
            {gamesLeft.map((pair) => (
              <div
                key={pair.key}
                className="flex items-center justify-between px-4 py-3 bg-gray-50/60 dark:bg-gray-900/40"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {pair.player1.name} vs {pair.player2.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Fixture pending &middot; schedule once
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Not played
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Games played</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {gamesPlayed.length} / {allPairings.length}
          </span>
        </div>
        {gamesPlayed.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Record your first match to start filling this list.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing {playedShowingFrom}-{playedShowingTo} of {gamesPlayed.length}
              </span>
              {playedTotalPages > 1 && (
                <span>
                  Page {playedPage} / {playedTotalPages}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedGamesPlayed.map(({ key, match, player1, player2, duplicateCount }) => (
                <div
                  key={key}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/70 dark:bg-gray-900/30"
                >
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>{formatDate(match.match_date)}</span>
                    {duplicateCount > 1 && (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Multiple results
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {player1.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {match.player1_score}
                      </p>
                    </div>
                    <div className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                      vs
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {player2.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {match.player2_score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {playedTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
                <button
                  type="button"
                  onClick={() => setPlayedPage(page => Math.max(1, page - 1))}
                  disabled={playedPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPlayedPage(page => Math.min(playedTotalPages, page + 1))}
                  disabled={playedPage === playedTotalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <ListChecks className="w-4 h-4" />
        Each player can only face another player once per fixture list. Use the overview above to
        keep the competition fair.
      </p>
    </div>
  );
}
