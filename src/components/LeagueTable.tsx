import { useEffect, useState } from 'react';
import { fetchStandings, resetLeague } from '../lib/api';
import { Award, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface Standing {
  player_id: string;
  player_name: string;
  team_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface LeagueTableProps {
  refreshKey?: number;
  onDataChange?: () => void;
}

export function LeagueTable({ refreshKey, onDataChange }: LeagueTableProps) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsableOpen, setCollapsableOpen] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadStandings();
  }, [refreshKey]);

  const loadStandings = async () => {
    setLoading(true);
    try {
      const data = await fetchStandings();
      setStandings(data);
    } catch (err) {
      console.error('Failed to load standings:', err);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetLeague();
      await loadStandings();
      onDataChange?.();
    } catch (err) {
      console.error('Failed to reset league:', err);
    }
    setResetting(false);
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

  const Header = (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setCollapsableOpen(!collapsableOpen)}
        className="flex items-center gap-2 text-gray-900 dark:text-white"
      >
        {collapsableOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Award className="w-5 h-5 text-blue-600" />
        <span className="text-lg font-semibold">League Standings</span>
      </button>
      <button
        type="button"
        onClick={handleReset}
        disabled={resetting}
        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
        {resetting ? 'Resetting...' : 'Reset League'}
      </button>
    </div>
  );

  if (standings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {Header}
        {collapsableOpen && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No matches recorded yet. Start playing to see the standings!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {Header}

      {!collapsableOpen ? null : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Player
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    W
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    D
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    L
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    GF
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    GA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    GD
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase font-bold">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {standings.map((standing, index) => (
                  <tr
                    key={standing.player_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{index + 1}</span>
                        {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{standing.player_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                      {standing.matches_played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                      {standing.wins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                      {standing.draws}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                      {standing.losses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                      {standing.goals_for}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                      {standing.goals_against}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-center text-sm font-medium ${
                      standing.goal_difference > 0 ? 'text-green-600' :
                      standing.goal_difference < 0 ? 'text-red-600' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                      {standing.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            P: Played | W: Wins | D: Draws | L: Losses | GF: Goals For | GA: Goals Against | GD: Goal Difference | Pts: Points
          </div>
        </>
      )}
    </div>
  );
}
