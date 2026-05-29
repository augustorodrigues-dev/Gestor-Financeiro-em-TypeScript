import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import AccountManager from './components/AccountManager';
import CategoryManager from './components/CategoryManager';
import CreditCardManager from './components/CreditCardManager';
import GoalManager from './components/GoalManager';
import Reports from './components/Reports';
import Profile from './components/Profile';

type View = 'dashboard' | 'accounts' | 'categories' | 'cards' | 'goals' | 'reports' | 'profile';

const TABS: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'accounts', label: 'Contas' },
  { id: 'categories', label: 'Categorias' },
  { id: 'cards', label: 'Cartões' },
  { id: 'goals', label: 'Metas' },
  { id: 'reports', label: 'Relatórios' },
  { id: 'profile', label: 'Perfil' },
];

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userSession, setUserSession] = useState<{ id: number; name: string; role: string } | null>(null);
  const [view, setView] = useState<View>('dashboard');

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
        <h1 className="text-lg font-extrabold tracking-wide text-shadow-sm sm:text-xl">FinanceFlow 💸</h1>

        {userSession && (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden text-sm opacity-90 sm:inline">
              Olá, <strong>{userSession.name}</strong>
              {userSession.role === 'ADMIN' && (
                <span className="ml-2 rounded bg-danger-500 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider shadow-sm">Admin</span>
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
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-2 py-2 sm:px-8" role="tablist" aria-label="Navegação principal">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${view === tab.id ? 'bg-brand-50 text-brand-700' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <main className="p-4 sm:p-8">
        {userSession ? (
          userSession.role === 'ADMIN' ? (
            <AdminPanel />
          ) : view === 'accounts' ? (
            <AccountManager />
          ) : view === 'categories' ? (
            <CategoryManager />
          ) : view === 'cards' ? (
            <CreditCardManager />
          ) : view === 'goals' ? (
            <GoalManager />
          ) : view === 'reports' ? (
            <Reports />
          ) : view === 'profile' ? (
            <Profile userName={userSession.name} onUpdated={(name) => setUserSession({ ...userSession, name })} />
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
