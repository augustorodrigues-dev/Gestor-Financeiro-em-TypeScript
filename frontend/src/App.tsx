import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="text-xl font-bold">FinanceFlow</h1>
        {isAuthenticated && <button onClick={() => setIsAuthenticated(false)}>Sair</button>}
      </nav>

      <main className="p-8">
        {!isAuthenticated ? (
          <Login onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

export default App;