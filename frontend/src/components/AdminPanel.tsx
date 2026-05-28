import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('USER');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setUsers([
        { id: 1, name: 'Jadão o Liso', email: 'jadao@gmail.com', role: 'USER' },
        { id: 2, name: 'DevOps Nando', email: 'nando@gmail.com', role: 'USER' },
        { id: 3, name: 'Alexandra Bargan', email: 'alexandra@gmail.com', role: 'ADMIN' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: 'ADMIN'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar administrador.');
      }

      alert(`👑 Administrador(a) "${adminName}" cadastrado(a) com sucesso no sistema!`);

      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');

      loadUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveUpdate = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          role: editRole
        })
      });

      if (!response.ok) throw new Error('Erro ao atualizar dados.');

      alert(`✅ Informações do usuário atualizadas com sucesso!`);
      setEditingUserId(null);
      loadUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (id === 3) return alert("Acesso negado: Você não pode excluir a conta da administradora principal!");

    if (!window.confirm(`Tem certeza absoluta que deseja banir o usuário "${name}"? Todas as contas e transações dele sumirão para sempre.`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir usuário.');

      alert('🗑️ Usuário removido do sistema!');
      loadUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-neutral-500">
      <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-neutral-200 border-t-danger-500" aria-hidden="true" />
      <span className="animate-pulse-soft">Carregando painel de controle...</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 animate-fade-in">

      {}
      <div className="rounded-xl2 bg-gradient-danger p-6 text-white shadow-soft animate-fade-in-down sm:p-8">
        <h1 className="text-2xl font-bold text-shadow-sm sm:text-3xl">👑 Painel de Administração Geral</h1>
        <p className="mt-1.5 text-sm text-danger-100">Bem-vinda, Alexandra. Aqui você pode criar novos administradores e gerenciar os privilégios das contas.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {}
        <div className="h-fit rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 border-b border-neutral-100 pb-2 text-base font-bold text-neutral-800">Criar Novo Administrador</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label htmlFor="admin-name" className="mb-1 block text-xs font-medium text-neutral-500">Nome Completo</label>
              <input id="admin-name" required type="text" placeholder="Ex: Roberto Carlos" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-200 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/30" />
            </div>
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-xs font-medium text-neutral-500">E-mail de Acesso</label>
              <input id="admin-email" required type="email" placeholder="nome@financeflow.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-200 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/30" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-xs font-medium text-neutral-500">Senha Inicial</label>
              <input id="admin-password" required type="password" placeholder="Mínimo 4 caracteres" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-200 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/30" />
            </div>
            <button type="submit" className="mt-2 w-full rounded-lg bg-danger-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-danger-200 transition-all duration-200 hover:bg-danger-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2">
              🚀 Cadastrar Administrador
            </button>
          </form>
        </div>

        {}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-card md:col-span-2">
          <div className="border-b border-neutral-200 p-5">
            <h3 className="font-bold text-neutral-800">Controle de Usuários e Níveis de Acesso</h3>
          </div>
          <ul className="divide-y divide-neutral-200">
            {users.map(u => (
              <li key={u.id} className="group flex items-center justify-between bg-white p-4 transition-colors hover:bg-neutral-50">

                {}
                {editingUserId === u.id ? (
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 gap-2 sm:mr-4">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} aria-label="Nome do usuário" className="w-2/3 rounded-lg border border-neutral-300 p-2 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} aria-label="Nível de acesso" className="w-1/3 rounded-lg border border-neutral-300 p-2 text-sm font-semibold text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSaveUpdate(u.id)} className="rounded-lg bg-success-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-success-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2">Salvar</button>
                      <button type="button" onClick={() => setEditingUserId(null)} className="rounded-lg bg-neutral-200 px-3 py-2 text-xs text-neutral-700 transition-colors hover:bg-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2">Cancelar</button>
                    </div>
                  </div>
                ) : (

                  <>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 font-semibold text-neutral-900">
                        {u.name}
                        <span className={`rounded px-2 py-0.5 text-2xs font-bold uppercase tracking-wider ${u.role === 'ADMIN' ? 'border border-danger-200 bg-danger-100 text-danger-700' : 'border border-neutral-200 bg-neutral-100 text-neutral-700'}`}>
                          {u.role}
                        </span>
                      </span>
                      <span className="mt-0.5 text-xs text-neutral-500">{u.email}</span>
                    </div>

                    {}
                    <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditName(u.name);
                          setEditRole(u.role);
                        }}
                        className="rounded p-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={`Editar ${u.name}`}
                        title="Editar Nome/Role"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="rounded p-1.5 text-sm font-semibold text-danger-500 transition-colors hover:bg-danger-50 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
                        aria-label={`Excluir ${u.name}`}
                        title="Excluir Usuário"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
