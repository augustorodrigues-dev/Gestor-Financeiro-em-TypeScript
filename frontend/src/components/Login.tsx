import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (userId: number, userName: string) => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(1, "Augusto Rodrigues");
    }, 800);
  };

  return (
    <div className="flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Entrar no FinanceFlow</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-500 mb-4">Acesso Rápido (Desenvolvimento)</p>
            <div className="flex gap-2">
              <button onClick={() => onLoginSuccess(1, "Usuário Teste 1")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded text-sm transition-colors">
                🧑‍💻 Logar como Jadao o Liso
              </button>
              <button onClick={() => onLoginSuccess(2, "Usuário Teste 2")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded text-sm transition-colors">
                👩‍💻 Logar como DevOpsNando
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={onNavigateToRegister} className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Não tem uma conta? Cadastre-se aqui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}