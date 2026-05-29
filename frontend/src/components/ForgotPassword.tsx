import { useState } from 'react';
import { forgotPassword, resetPassword } from '../services/userService';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const res = await forgotPassword(email);
      setMsg(res.message);
      // Sem serviço de e-mail, o backend devolve o token para o fluxo de demonstração
      if (res.resetToken) {
        setToken(res.resetToken);
        setStep('reset');
      }
    } catch (err: any) { setError(err.message); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await resetPassword(token, password);
      setMsg('Senha redefinida com sucesso! Você já pode entrar.');
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">Recuperar Senha</h2>
        <p className="mt-2 text-sm text-neutral-500">Informe seu e-mail para redefinir o acesso.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl2 border border-neutral-200 bg-white px-4 py-8 shadow-soft sm:px-10">
          {error && <div role="alert" className="mb-4 rounded-lg border-l-4 border-danger-400 bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}
          {msg && <div role="status" className="mb-4 rounded-lg border-l-4 border-success-400 bg-success-50 p-3 text-sm text-success-700">{msg}</div>}

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="block text-sm font-semibold text-neutral-700">E-mail de recuperação</label>
                <input id="fp-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="exemplo@email.com" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Enviar link de redefinição</button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label htmlFor="fp-token" className="block text-sm font-semibold text-neutral-700">Token</label>
                <input id="fp-token" required value={token} onChange={e => setToken(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </div>
              <div>
                <label htmlFor="fp-newpass" className="block text-sm font-semibold text-neutral-700">Nova Senha</label>
                <input id="fp-newpass" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-success-600 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-success-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2">Redefinir Senha</button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={onBack} className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">← Voltar para o login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
