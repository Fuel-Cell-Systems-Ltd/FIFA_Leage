import { useEffect, useMemo, useState } from 'react';
import {
  fetchPlayers,
  fetchTeams,
  updatePlayer,
  deletePlayer,
  updateTeam,
  deleteTeam,
  createTeam
} from '../lib/api';
import { Users, Trash2, Save, X, Edit3, Plus } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  team_id: string | null;
}

interface Team {
  id: string;
  name: string;
}

interface PlayerManagerProps {
  onChange?: () => void;
  open?: boolean;
  onClose?: () => void;
}

export function PlayerManager({ onChange, open = false, onClose }: PlayerManagerProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState({ name: '', team_id: '' });
  const [teamEdits, setTeamEdits] = useState<Record<string, string>>({});
  const [newTeam, setNewTeam] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEditingPlayerId(null);
      setError('');
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [playersData, teamsData] = await Promise.all([fetchPlayers(), fetchTeams()]);
      setPlayers(playersData);
      setTeams(teamsData);
      setTeamEdits(Object.fromEntries(teamsData.map((t: Team) => [t.id, t.name])));
    } catch (err) {
      setError('Failed to load players/teams');
      console.error(err);
    }
    setLoading(false);
  };

  const startEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setPlayerForm({ name: player.name, team_id: player.team_id || '' });
    setError('');
  };

  const cancelEditPlayer = () => {
    setEditingPlayerId(null);
    setError('');
  };

  const savePlayer = async () => {
    if (!editingPlayerId) return;
    setSaving(true);
    setError('');
    try {
      await updatePlayer(editingPlayerId, playerForm.name.trim(), playerForm.team_id || null);
      setEditingPlayerId(null);
      await loadData();
      onChange?.();
    } catch (err) {
      setError('Failed to save player');
      console.error(err);
    }
    setSaving(false);
  };

  const removePlayer = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await deletePlayer(id);
      await loadData();
      onChange?.();
    } catch (err) {
      setError('Failed to delete player');
      console.error(err);
    }
    setSaving(false);
  };

  const saveTeam = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await updateTeam(id, teamEdits[id].trim());
      await loadData();
      onChange?.();
    } catch (err) {
      setError('Failed to update team');
      console.error(err);
    }
    setSaving(false);
  };

  const removeTeam = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await deleteTeam(id);
      await loadData();
      onChange?.();
    } catch (err) {
      setError('Failed to delete team');
      console.error(err);
    }
    setSaving(false);
  };

  const addTeam = async () => {
    if (!newTeam.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createTeam(newTeam.trim());
      setNewTeam('');
      await loadData();
      onChange?.();
    } catch (err) {
      setError('Failed to add team');
      console.error(err);
    }
    setSaving(false);
  };

  const teamOptions = useMemo(
    () => teams.map(t => ({ value: t.id, label: t.name })),
    [teams]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur" onClick={onClose}>
      <div
        className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Players & Teams</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Close manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Players</h3>
              <div className="space-y-3">
                {players.map((player) => {
                  const isEditing = editingPlayerId === player.id;
                  return (
                    <div key={player.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <input
                            type="text"
                            value={playerForm.name}
                            onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          />
                          <select
                            value={playerForm.team_id}
                            onChange={(e) => setPlayerForm({ ...playerForm, team_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">No team</option>
                            {teamOptions.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditPlayer}
                              className="px-3 py-2 text-xs flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={savePlayer}
                              className="px-3 py-2 text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{player.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Team: {teams.find(t => t.id === player.team_id)?.name || 'None'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditPlayer(player)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => removePlayer(player.id)}
                              className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Teams</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="New team name"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addTeam}
                    disabled={saving || !newTeam.trim()}
                    className="px-3 py-2 text-xs flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={teamEdits[team.id] ?? team.name}
                      onChange={(e) => setTeamEdits({ ...teamEdits, [team.id]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveTeam(team.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => removeTeam(team.id)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
