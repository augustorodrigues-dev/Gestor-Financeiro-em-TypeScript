import { useState } from 'react';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  onLoginSuccess: (userId: number, userName: string, role: string) => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

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
    <div className="flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-2xl shadow-glow">
          💸
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
          Entrar no <span className="text-gradient">FinanceFlow</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Gerencie suas contas e despesas em um só lugar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl2 border border-neutral-200 bg-white px-4 py-8 shadow-soft sm:px-10">

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border-l-4 border-danger-400 bg-danger-50 p-4 text-sm text-danger-700 animate-fade-in">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-neutral-700">E-mail</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="exemplo@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-neutral-700">Senha</label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg border border-transparent bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Acesso Rápido
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => performLogin('jadao@gmail.com', '1234')}
                  className="w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-all duration-200 hover:bg-brand-100 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                  💸 Jadão o Liso
                </button>
                <button
                  onClick={() => performLogin('nando@gmail.com', '1234')}
                  className="w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition-all duration-200 hover:bg-purple-100 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
                >
                  🐳 DevOps Nando
                </button>
              </div>
              <button
                onClick={() => performLogin('alexandra@gmail.com', '1234')}
                className="w-full rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-danger-700 transition-all duration-200 hover:bg-danger-100 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-1"
              >
                👑 Entrar como Admin (Alexandra)
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-center">
            <button
              onClick={onNavigateToRegister}
              className="block w-full rounded text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Não tem uma conta? Cadastre-se aqui
            </button>
            <button
              onClick={() => setShowForgot(true)}
              className="block w-full rounded text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Esqueci minha senha
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
