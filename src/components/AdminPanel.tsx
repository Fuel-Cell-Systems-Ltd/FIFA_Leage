import { useState } from 'react';
import { ShieldAlert, Trash2, Lock, CheckCircle, XCircle } from 'lucide-react';
import { resetLeague } from '../lib/api';

interface AdminPanelProps {
  hasEditAccess: boolean;
  onDataChange?: () => void;
}

export function AdminPanel({ hasEditAccess, onDataChange }: AdminPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetClick = () => {
    if (!hasEditAccess) return;
    setError('');
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (resetting) return;
    setConfirmOpen(false);
  };

  const confirmReset = async () => {
    setResetting(true);
    setError('');
    setSuccess('');
    try {
      await resetLeague();
      setSuccess('League data cleared successfully.');
      onDataChange?.();
      setConfirmOpen(false);
    } catch (err) {
      console.error('Failed to reset league', err);
      setError('Unable to reset league. Try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dangerous actions live here. Use with caution.
            </p>
          </div>
        </div>

        {!hasEditAccess && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
            <Lock className="w-4 h-4" />
            Enter the passkey to unlock admin actions.
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Reset league</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Deletes all matches and standings data. Player and team records remain intact.
          </p>
          <button
            type="button"
            onClick={handleResetClick}
            disabled={!hasEditAccess}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Reset League
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm reset</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will remove all recorded matches and standings. This action cannot be undone.
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={resetting}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                disabled={resetting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {resetting && <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />}
                {resetting ? 'Resetting...' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

