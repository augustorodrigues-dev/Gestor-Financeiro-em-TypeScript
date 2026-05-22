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

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando painel de controle...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      
      {}
      <div className="bg-red-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">👑 Painel de Administração Geral</h1>
        <p className="text-red-100 text-sm mt-1">Bem-vinda, Alexandra. Aqui você pode criar novos administradores e gerenciar os privilégios das contas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {}
        <div className="bg-white p-5 rounded-lg shadow shadow-red-100 border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 text-base border-b pb-2 border-gray-100">Criar Novo Administrador</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Nome Completo</label>
              <input required type="text" placeholder="Ex: Roberto Carlos" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-red-500 text-gray-900" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">E-mail de Acesso</label>
              <input required type="email" placeholder="nome@financeflow.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-red-500 text-gray-900" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Senha Inicial</label>
              <input required type="password" placeholder="Mínimo 4 caracteres" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-red-500 text-gray-900" />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm transition shadow-md shadow-red-200 mt-2">
              🚀 Cadastrar Administrador
            </button>
          </form>
        </div>

        {}
        <div className="md:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Controle de Usuários e Níveis de Acesso</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {users.map(u => (
              <li key={u.id} className="p-4 flex justify-between items-center bg-white transition-colors group">
                
                {}
                {editingUserId === u.id ? (
                  <div className="flex gap-2 w-full items-center justify-between">
                    <div className="flex gap-2 flex-1 mr-4">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border p-2 rounded text-sm text-gray-900 w-2/3 outline-none focus:border-blue-500" />
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} className="border p-2 rounded text-sm text-gray-900 w-1/3 outline-none focus:border-blue-500 font-semibold">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveUpdate(u.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-xs font-bold transition">Salvar</button>
                      <button onClick={() => setEditingUserId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-xs transition">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  
                  <>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        {u.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {u.role}
                        </span>
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">{u.email}</span>
                    </div>
                    
                    {}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditName(u.name);
                          setEditRole(u.role);
                        }} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold p-1.5 rounded hover:bg-blue-50 transition"
                        title="Editar Nome/Role"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold p-1.5 rounded hover:bg-red-50 transition"
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