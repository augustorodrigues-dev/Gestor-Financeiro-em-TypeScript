import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import AccountManager from './components/AccountManager';

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [userSession, setUserSession] = useState<{ id: number; name: string; role: string } | null>(null);

  const [view, setView] = useState<'dashboard' | 'accounts'>('dashboard');

  const handleAuthSuccess = (id: number, name: string, role: string = 'USER') => {
    setUserSession({ id, name, role });
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserSession(null);
    setAuthMode('login');
  };

  const isUser = userSession && userSession.role !== 'ADMIN';

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
      <nav className="sticky top-0 z-20 flex items-center justify-between bg-gradient-brand px-4 py-3 text-white shadow-card sm:px-8">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-extrabold tracking-wide text-shadow-sm sm:text-xl">FinanceFlow 💸</h1>

          {isUser && (
            <div className="hidden items-center gap-1 sm:flex" role="tablist" aria-label="Navegação principal">
              <button
                role="tab"
                aria-selected={view === 'dashboard'}
                onClick={() => setView('dashboard')}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${view === 'dashboard' ? 'bg-white/20 text-white' : 'text-brand-100 hover:bg-white/10'}`}
              >
                Painel
              </button>
              <button
                role="tab"
                aria-selected={view === 'accounts'}
                onClick={() => setView('accounts')}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${view === 'accounts' ? 'bg-white/20 text-white' : 'text-brand-100 hover:bg-white/10'}`}
              >
                Minhas Contas
              </button>
            </div>
          )}
        </div>

        {userSession && (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm opacity-90">
              Olá, <strong>{userSession.name}</strong>
              {userSession.role === 'ADMIN' && (
                <span className="ml-2 rounded bg-danger-500 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider shadow-sm">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-white/15 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Sair
            </button>
          </div>
        )}
      </nav>

      {isUser && (
        <div className="flex gap-1 border-b border-neutral-200 bg-white px-4 py-2 sm:hidden" role="tablist" aria-label="Navegação principal">
          <button
            role="tab"
            aria-selected={view === 'dashboard'}
            onClick={() => setView('dashboard')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${view === 'dashboard' ? 'bg-brand-50 text-brand-700' : 'text-neutral-500'}`}
          >
            Painel
          </button>
          <button
            role="tab"
            aria-selected={view === 'accounts'}
            onClick={() => setView('accounts')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${view === 'accounts' ? 'bg-brand-50 text-brand-700' : 'text-neutral-500'}`}
          >
            Minhas Contas
          </button>
        </div>
      )}

      <main className="p-4 sm:p-8">
        {userSession ? (
          userSession.role === 'ADMIN' ? (
            <AdminPanel />
          ) : view === 'accounts' ? (
            <AccountManager />
          ) : (
            <Dashboard userId={userSession.id} userNameSession={userSession.name} />
          )
        ) : authMode === 'login' ? (
          <Login
            onLoginSuccess={handleAuthSuccess}
            onNavigateToRegister={() => setAuthMode('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleAuthSuccess}
            onNavigateToLogin={() => setAuthMode('login')}
          />
        )}
      </main>
    </div>
  );
}
