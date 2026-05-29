import { useState } from 'react';
import { updateProfile } from '../services/userService';

interface ProfileProps {
  userName: string;
  onUpdated: (name: string) => void;
}

export default function Profile({ userName, onUpdated }: ProfileProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const payload: any = {};
      if (name) payload.name = name;
      if (email) payload.email = email;
      if (password) payload.password = password;
      const res = await updateProfile(payload);
      setMsg('Perfil atualizado com sucesso!');
      setPassword('');
      if (res.user?.name) onUpdated(res.user.name);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4 sm:p-6 animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-800">Editar Perfil</h2>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        {error && <div role="alert" className="rounded-lg border-l-4 border-danger-400 bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}
        {msg && <div role="status" className="rounded-lg border-l-4 border-success-400 bg-success-50 p-3 text-sm text-success-700">{msg}</div>}

        <div>
          <label htmlFor="pf-name" className="block text-sm font-semibold text-neutral-700">Nome</label>
          <input id="pf-name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
        </div>
        <div>
          <label htmlFor="pf-email" className="block text-sm font-semibold text-neutral-700">Novo E-mail <span className="font-normal text-neutral-400">(opcional)</span></label>
          <input id="pf-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="deixe em branco para manter" />
        </div>
        <div>
          <label htmlFor="pf-password" className="block text-sm font-semibold text-neutral-700">Nova Senha <span className="font-normal text-neutral-400">(opcional)</span></label>
          <input id="pf-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 p-2.5 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="••••••••" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Salvar Alterações</button>
      </form>
    </div>
  );
}
