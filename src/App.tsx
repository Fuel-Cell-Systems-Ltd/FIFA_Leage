import { useState, useEffect } from 'react';
import { PlayerRegistration } from './components/PlayerRegistration';
import { MatchRecorder } from './components/MatchRecorder';
import { LeagueTable } from './components/LeagueTable';
import { MatchHistory } from './components/MatchHistory';
import { PlayerManager } from './components/PlayerManager';
import { PositionTrendChart } from './components/PositionTrendChart';
import { Moon, Sun, Users, Award, History, LineChart, LayoutGrid } from 'lucide-react';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [activePage, setActivePage] = useState<'league' | 'history' | 'positions'>('league');
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

  const navItems = [
    { key: 'league', label: 'League', icon: LayoutGrid },
    { key: 'history', label: 'History', icon: History },
    { key: 'positions', label: 'Position Graph', icon: LineChart }
  ] as const;

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setManagerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                Manage players & teams
              </button>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 w-full">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">FIFA League</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose a page</p>
                </div>
              </div>
              <nav className="flex flex-col">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activePage === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActivePage(item.key)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-100 border-l-4 border-blue-600'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="flex-1 space-y-6">
            {activePage === 'league' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PlayerRegistration onPlayerAdded={handleDataChange} />
                  <MatchRecorder onMatchRecorded={handleDataChange} refreshKey={refreshKey} />
                </div>
                <LeagueTable refreshKey={refreshKey} onDataChange={handleDataChange} />
              </>
            )}

            {activePage === 'history' && (
              <MatchHistory
                refreshKey={refreshKey}
                onDataChange={handleDataChange}
              />
            )}

            {activePage === 'positions' && (
              <PositionTrendChart refreshKey={refreshKey} />
            )}
          </section>
        </div>

        <PlayerManager
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
          onChange={handleDataChange}
        />
      </main>
    </div>
  );
}

export default App;
