import { useEffect, useMemo, useState } from 'react';
import { fetchMatches, fetchPlayers } from '../lib/api';
import { LineChart, RefreshCw } from 'lucide-react';

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

interface PositionTrendChartProps {
  refreshKey?: number;
  className?: string;
}

interface Standing {
  player_id: string;
  player_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface PositionSnapshot {
  matchId: string;
  label: string;
  date: string;
  positions: Record<string, number>;
}

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#9333ea',
  '#06b6d4',
  '#dc2626',
  '#0ea5e9',
  '#d97706',
  '#14b8a6',
  '#8b5cf6'
];

const chartWidth = 900;
const chartHeight = 340;
const padding = { top: 24, right: 32, bottom: 56, left: 60 };

export function PositionTrendChart({ refreshKey, className = '' }: PositionTrendChartProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlight, setHighlight] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [playersData, matchesData] = await Promise.all([
          fetchPlayers(),
          fetchMatches()
        ]);
        if (!isMounted) return;
        setPlayers(playersData);
        setMatches(matchesData);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load data for position graph.');
        console.error(err);
      }
      if (isMounted) setLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const orderedMatches = useMemo(
    () =>
      matches
        .slice()
        .sort(
          (a, b) =>
            new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        ),
    [matches]
  );

  const positionSnapshots: PositionSnapshot[] = useMemo(() => {
    if (!players.length || !orderedMatches.length) return [];

    const standingsMap = new Map<string, Standing>();
    players.forEach((player) => {
      standingsMap.set(player.id, {
        player_id: player.id,
        player_name: player.name,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0
      });
    });

    const snapshots: PositionSnapshot[] = [];

    orderedMatches.forEach((match, index) => {
      const p1 = standingsMap.get(match.player1_id);
      const p2 = standingsMap.get(match.player2_id);
      if (!p1 || !p2) {
        return;
      }

      p1.matches_played++;
      p2.matches_played++;
      p1.goals_for += match.player1_score;
      p1.goals_against += match.player2_score;
      p2.goals_for += match.player2_score;
      p2.goals_against += match.player1_score;

      if (match.player1_score > match.player2_score) {
        p1.wins++;
        p1.points += 3;
        p2.losses++;
      } else if (match.player2_score > match.player1_score) {
        p2.wins++;
        p2.points += 3;
        p1.losses++;
      } else {
        p1.draws++;
        p2.draws++;
        p1.points += 1;
        p2.points += 1;
      }

      p1.goal_difference = p1.goals_for - p1.goals_against;
      p2.goal_difference = p2.goals_for - p2.goals_against;

      const standings = Array.from(standingsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) {
          return b.goal_difference - a.goal_difference;
        }
        return b.goals_for - a.goals_for;
      });

      const positions: Record<string, number> = {};
      standings.forEach((standing, pos) => {
        positions[standing.player_id] = pos + 1;
      });

      snapshots.push({
        matchId: match.id,
        label: `Match ${index + 1}`,
        date: match.match_date,
        positions
      });
    });

    return snapshots;
  }, [orderedMatches, players]);

  const playerSeries = useMemo(() => {
    const maxPlayers = players.length || 1;
    return players.map((player, idx) => ({
      id: player.id,
      name: player.name,
      color: COLORS[idx % COLORS.length],
      points: positionSnapshots.map((snapshot) => ({
        x: snapshot.label,
        pos: snapshot.positions[player.id] ?? maxPlayers
      }))
    }));
  }, [players, positionSnapshots]);

  const maxPosition = useMemo(() => {
    const base = players.length || 1;
    const perSeriesMax = playerSeries.map((series) =>
      series.points.length ? Math.max(...series.points.map((pt) => pt.pos || base)) : base
    );
    return Math.max(base, ...perSeriesMax);
  }, [playerSeries, players.length]);
  const xStep = positionSnapshots.length > 1
    ? (chartWidth - padding.left - padding.right) / (positionSnapshots.length - 1)
    : 0;
  const yScale = maxPosition > 1
    ? (chartHeight - padding.top - padding.bottom) / (maxPosition - 1)
    : 0;

  const yForPosition = (position: number) =>
    padding.top + (position - 1) * yScale;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Position over time</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rank after each recorded match</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Updated live
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !positionSnapshots.length ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-300">
            Record a match to start tracking positions over time.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Highlight</label>
              <select
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-80"
                role="img"
                aria-label="Player position chart"
              >
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={chartHeight - padding.bottom}
                  className="stroke-gray-300 dark:stroke-gray-600"
                  strokeWidth={1}
                />
                <line
                  x1={padding.left}
                  y1={chartHeight - padding.bottom}
                  x2={chartWidth - padding.right}
                  y2={chartHeight - padding.bottom}
                  className="stroke-gray-300 dark:stroke-gray-600"
                  strokeWidth={1}
                />

                {Array.from({ length: maxPosition }, (_, idx) => idx + 1).map((pos) => {
                  const y = yForPosition(pos);
                  return (
                    <g key={pos}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        className="stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth={1}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        className="text-xs fill-gray-500 dark:fill-gray-400"
                      >
                        {pos}
                      </text>
                    </g>
                  );
                })}

                {positionSnapshots.map((snapshot, idx) => {
                  const x = padding.left + idx * xStep;
                  return (
                    <text
                      key={snapshot.matchId}
                      x={x}
                      y={chartHeight - padding.bottom + 18}
                      className="text-xs fill-gray-500 dark:fill-gray-400"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  );
                })}

                {playerSeries.map((series) => {
                  const isDimmed = highlight !== 'all' && highlight !== series.id;
                  const path = series.points
                    .map((point, idx) => {
                      const x = padding.left + idx * xStep;
                      const y = yForPosition(point.pos);
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ');

                  return (
                    <g key={series.id}>
                      <path
                        d={path}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={isDimmed ? 1.5 : 2.5}
                        strokeOpacity={isDimmed ? 0.35 : 0.9}
                      />
                      {series.points.map((point, idx) => {
                        const x = padding.left + idx * xStep;
                        const y = yForPosition(point.pos);
                        return (
                          <circle
                            key={`${series.id}-${idx}`}
                            cx={x}
                            cy={y}
                            r={isDimmed ? 2 : 3.5}
                            fill={series.color}
                            fillOpacity={isDimmed ? 0.4 : 1}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {playerSeries.map((series) => {
                const isActive = highlight === 'all' || highlight === series.id;
                return (
                  <button
                    key={series.id}
                    type="button"
                    onClick={() => setHighlight(series.id === highlight ? 'all' : series.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors ${
                      isActive
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: series.color }}
                    ></span>
                    {series.name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
