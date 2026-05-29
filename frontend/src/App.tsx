import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet'; // 🚀 Importação da nova tela
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel'; 

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userSession, setUserSession] = useState<{ id: number; name: string; role: string } | null>(null);
  
  // 🚀 Novo estado para controlar a aba ativa do usuário comum
  const [currentView, setCurrentView] = useState<'dashboard' | 'wallet'>('dashboard');

  const handleAuthSuccess = (id: number, name: string, role: string = 'USER') => {
    setUserSession({ id, name, role });
    setCurrentView('dashboard'); // Reseta para o Dashboard ao fazer login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserSession(null);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        
        {/* Lado Esquerdo: Logo e Menu de Navegação */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">FinanceFlow 💸</h1>
          
          {/* 🚀 Menu visível apenas para Usuários Comuns Logados */}
          {userSession && userSession.role !== 'ADMIN' && (
            <div className="hidden sm:flex gap-2 bg-blue-700/50 p-1 rounded-lg">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('wallet')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'wallet' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >
                💼 Carteira
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito: Info do Usuário e Logout */}
        {userSession && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">
              Olá, <strong>{userSession.name}</strong>
              {userSession.role === 'ADMIN' && (
                <span className="ml-2 bg-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Admin
                </span>
              )}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded text-sm transition-colors shadow-sm"
            >
              Sair
            </button>
          </div>
        )}
      </nav>

      <main className="p-4 sm:p-8">
        {userSession ? (
          userSession.role === 'ADMIN' ? (
            <AdminPanel />
          ) : (
            // 🚀 Condicional que renderiza a aba selecionada pelo usuário
            currentView === 'dashboard' ? (
              <Dashboard userId={userSession.id} userNameSession={userSession.name} />
            ) : (
              <Wallet userId={userSession.id} />
            )
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