import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register'; 

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [userSession, setUserSession] = useState<{ id: number; name: string } | null>(null);

  const handleAuthSuccess = (id: number, name: string) => {
    setUserSession({ id, name });
  };

  const handleLogout = () => {
    setUserSession(null);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">FinanceFlow 💸</h1>
        {userSession && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">
              Olá, <strong>{userSession.name}</strong>
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        )}
      </nav>

      {}
      <main className="p-8">
        {userSession ? (
          <Dashboard userId={userSession.id} />
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