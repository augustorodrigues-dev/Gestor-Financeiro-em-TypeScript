import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (userId: number, userName: string, role: string) => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar login.');
      }

      localStorage.setItem('token', data.token);

      onLoginSuccess(data.user.id, data.user.name, data.user.role);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Entrar no FinanceFlow
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="exemplo@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-bold"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-500 mb-4 font-medium">
              Acesso Rápido
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => performLogin('jadao@gmail.com', '1234')}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded text-sm transition-colors border border-blue-200"
                >
                  💸 Jadão o Liso
                </button>
                <button
                  onClick={() => performLogin('nando@gmail.com', '1234')}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded text-sm transition-colors border border-purple-200"
                >
                  🐳 DevOps Nando
                </button>
              </div>
              <button
                onClick={() => performLogin('alexandra@gmail.com', '1234')}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded text-sm transition-colors border border-red-200 uppercase tracking-wider"
              >
                👑 Entrar como Admin (Alexandra)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToRegister}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Não tem uma conta? Cadastre-se aqui
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}