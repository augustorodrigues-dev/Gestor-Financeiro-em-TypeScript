import { useState } from 'react';
import { registerUser } from '../services/userService';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (userId: number, userName: string, role: string) => void;
}

export default function Register({ onNavigateToLogin, onRegisterSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await registerUser({ name, email, password });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      alert('🎉 Conta criada com sucesso!');

      if (data.user && data.user.id) {
        onRegisterSuccess(data.user.id, data.user.name, data.user.role || 'USER');
      } else {
        setError('O servidor não retornou os dados do usuário corretamente.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-success text-2xl shadow-glow-success">
          🚀
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
          Crie sua conta no <span className="text-gradient">FinanceFlow</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Comece a organizar suas finanças em poucos segundos.
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
              <label htmlFor="register-name" className="block text-sm font-semibold text-neutral-700">Nome Completo</label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="Seu Nome Completo"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-semibold text-neutral-700">E-mail</label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-semibold text-neutral-700">Senha</label>
              <input
                id="register-password"
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
              {loading ? 'Processando...' : 'Cadastrar e Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToLogin}
              className="rounded text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Já tem uma conta? Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
