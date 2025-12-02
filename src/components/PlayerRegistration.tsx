import { useState, useEffect } from 'react';
import { fetchTeams, createPlayer, createTeam } from '../lib/api';
import { UserPlus, Plus } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

export function PlayerRegistration({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  const [name, setName] = useState('');
  const [fifaTeam, setFifaTeam] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fifaTeam) return;

    setLoading(true);
    setError('');

    try {
      await createPlayer(name.trim(), fifaTeam);
      setName('');
      setFifaTeam('');
      onPlayerAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register player');
    }

    setLoading(false);
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowAddTeam(false);
      await loadTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Register Player</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Player Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter player name"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              FIFA Team
            </label>
            <button
              type="button"
              onClick={() => setShowAddTeam(!showAddTeam)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Team
            </button>
          </div>

          {showAddTeam && (
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new team name"
              />
              <button
                type="button"
                onClick={handleAddTeam}
                disabled={loading || !newTeamName.trim()}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
          )}

          <select
            id="team"
            value={fifaTeam}
            onChange={(e) => setFifaTeam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
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
          {loading ? 'Registering...' : 'Register Player'}
        </button>
      </form>
    </div>
  );
}
