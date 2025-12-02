import { useEffect, useMemo, useState } from 'react';
import { fetchMatches, fetchPlayers, updateMatch } from '../lib/api';
import { History, Pencil, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

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

interface MatchHistoryProps {
  refreshKey?: number;
  onDataChange?: () => void;
  className?: string;
}

const MAX_VISIBLE_MATCHES = 10;

export function MatchHistory({ refreshKey, onDataChange, className = '' }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [loading, setLoading] = useState(true);
  const [collapsableOpen, setCollapsableOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    player1_id: '',
    player2_id: '',
    player1_score: 0,
    player2_score: 0,
    match_date: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [matchesData, playersData] = await Promise.all([
        fetchMatches(),
        fetchPlayers()
      ]);

      const sortedMatches = matchesData
        .slice()
        .sort((a: Match, b: Match) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

      setMatches(sortedMatches);
      const playersMap = new Map(playersData.map((p: Player) => [p.id, p]));
      setPlayers(playersMap);
    } catch (err) {
      setError('Failed to load matches');
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

  const startEdit = (match: Match) => {
    setEditingId(match.id);
    setEditForm({
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      player1_score: match.player1_score,
      player2_score: match.player2_score,
      match_date: match.match_date.slice(0, 16)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const submitEdit = async () => {
    if (!editingId) return;
    if (editForm.player1_id === editForm.player2_id) {
      setError('Players must be different');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateMatch(
        editingId,
        editForm.player1_id,
        editForm.player2_id,
        editForm.player1_score,
        editForm.player2_score,
        new Date(editForm.match_date).toISOString()
      );
      setEditingId(null);
      await loadData();
      onDataChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
    setSaving(false);
  };

  const visibleMatches = useMemo(
    () => matches.slice(0, MAX_VISIBLE_MATCHES),
    [matches]
  );

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const Header = (
    <div className="flex items-center justify-between mb-4">
      <button
        type="button"
        onClick={() => setCollapsableOpen(!collapsableOpen)}
        className="flex items-center gap-2 text-gray-900 dark:text-white"
      >
        {collapsableOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <History className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Recent Matches</h2>
      </button>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Showing latest {visibleMatches.length}{matches.length > MAX_VISIBLE_MATCHES ? ` of ${matches.length}` : ''}
      </div>
    </div>
  );

  if (matches.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {Header}
        {collapsableOpen && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No matches recorded yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {Header}

      {!collapsableOpen ? null : (
        <>
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {visibleMatches.map((match) => {
              const player1 = players.get(match.player1_id);
              const player2 = players.get(match.player2_id);
              if (!player1 || !player2) return null;

              const isPlayer1Winner = match.player1_score > match.player2_score;
              const isPlayer2Winner = match.player2_score > match.player1_score;

              const isEditing = editingId === match.id;

              return (
                <div
                  key={match.id}
                  className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50/50 dark:bg-gray-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isPlayer1Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {player1.name}
                        </span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {match.player1_score}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm font-medium ${isPlayer2Winner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {player2.name}
                        </span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {match.player2_score}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(match.match_date)}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400">Player 1</label>
                        <select
                          value={editForm.player1_id}
                          onChange={(e) => setEditForm({ ...editForm, player1_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        >
                          {[...players.values()].map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={editForm.player1_score}
                          onChange={(e) => setEditForm({ ...editForm, player1_score: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400">Player 2</label>
                        <select
                          value={editForm.player2_id}
                          onChange={(e) => setEditForm({ ...editForm, player2_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        >
                          {[...players.values()].map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={editForm.player2_score}
                          onChange={(e) => setEditForm({ ...editForm, player2_score: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400">Match date/time</label>
                        <input
                          type="datetime-local"
                          value={editForm.match_date}
                          onChange={(e) => setEditForm({ ...editForm, match_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-2 text-xs flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={submitEdit}
                          className="px-3 py-2 text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => startEdit(match)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
