import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet'; 
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel'; 
import { GoalManager } from './components/GoalManager';
import { CategoryManager } from './components/CategoryManager'; // 🚀 Importação da nova tela

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userSession, setUserSession] = useState<{ id: number; name: string; role: string } | null>(null);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'wallet' | 'goals' | 'categories'>('dashboard');

  const handleAuthSuccess = (id: number, name: string, role: string = 'USER') => {
    setUserSession({ id, name, role });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserSession(null);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">FinanceFlow 💸</h1>
          
          {userSession && userSession.role !== 'ADMIN' && (
            <div className="hidden sm:flex gap-2 bg-blue-700/50 p-1 rounded-lg">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >📊 Dashboard</button>
              
              <button 
                onClick={() => setCurrentView('wallet')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'wallet' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >💼 Carteira</button>

              <button 
                onClick={() => setCurrentView('goals')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'goals' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >🎯 Metas</button>

              {}
              <button 
                onClick={() => setCurrentView('categories')}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  currentView === 'categories' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >🏷️ Categorias</button>
            </div>
          )}
        </div>

        {userSession && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">Olá, <strong>{userSession.name}</strong></span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded text-sm transition-colors shadow-sm">Sair</button>
          </div>
        )}
      </nav>

      <main className="p-4 sm:p-8">
        {userSession ? (
          userSession.role === 'ADMIN' ? (
            <AdminPanel />
          ) : (
            currentView === 'dashboard' ? <Dashboard userId={userSession.id} userNameSession={userSession.name} /> :
            currentView === 'wallet' ? <Wallet userId={userSession.id} /> :
            currentView === 'goals' ? <GoalManager /> :
            <CategoryManager />
          )
        ) : authMode === 'login' ? (
          <Login onLoginSuccess={handleAuthSuccess} onNavigateToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onRegisterSuccess={handleAuthSuccess} onNavigateToLogin={() => setAuthMode('login')} />
        )}
      </main>
    </div>
  );
}