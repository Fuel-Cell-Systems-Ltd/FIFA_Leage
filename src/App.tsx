import { useState, useEffect } from 'react';
import { PlayerRegistration } from './components/PlayerRegistration';
import { MatchRecorder } from './components/MatchRecorder';
import { LeagueTable } from './components/LeagueTable';
import { MatchHistory } from './components/MatchHistory';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Fuel Cell Systems Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fuel Cell Systems FIFA League</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Company Championship</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PlayerRegistration onPlayerAdded={handleDataChange} />
          <MatchRecorder onMatchRecorded={handleDataChange} refreshKey={refreshKey} />
        </div>

        <div key={refreshKey} className="space-y-6">
          <LeagueTable refreshKey={refreshKey} onDataChange={handleDataChange} />
          <MatchHistory refreshKey={refreshKey} onDataChange={handleDataChange} />
        </div>
      </main>
    </div>
  );
}

export default App;
