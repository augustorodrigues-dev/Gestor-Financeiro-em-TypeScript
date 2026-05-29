import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

interface Category {
  id: number;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#6366f1');

  const load = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await categoryService.createCategory({ name, type, icon, color });
      setName(''); setIcon('');
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    try {
      await categoryService.deleteCategory(id);
      load();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-800">Categorias</h2>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border-l-4 border-danger-400 bg-danger-50 px-4 py-3 text-danger-700">{error}</div>
      )}

      <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="cat-name" className="mb-1 block text-sm font-medium text-neutral-600">Nome</label>
          <input id="cat-name" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Ex: Transporte" />
        </div>
        <div className="sm:w-40">
          <label htmlFor="cat-type" className="mb-1 block text-sm font-medium text-neutral-600">Tipo</label>
          <select id="cat-type" value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>
        <div className="sm:w-24">
          <label htmlFor="cat-icon" className="mb-1 block text-sm font-medium text-neutral-600">Ícone</label>
          <input id="cat-icon" value={icon} onChange={e => setIcon(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-center text-sm outline-none focus:border-brand-500" placeholder="🍔" />
        </div>
        <div className="sm:w-20">
          <label htmlFor="cat-color" className="mb-1 block text-sm font-medium text-neutral-600">Cor</label>
          <input id="cat-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-11 w-full rounded-lg border border-neutral-300 p-1" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Adicionar</button>
      </form>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-card" style={{ borderLeftWidth: 4, borderLeftColor: cat.color || '#cbd5e1' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{cat.icon || '🏷️'}</span>
              <div>
                <p className="font-bold text-neutral-800">{cat.name}</p>
                <p className="text-xs text-neutral-500">{cat.type === 'INCOME' ? 'Receita' : 'Despesa'}{cat.isDefault ? ' • padrão' : ''}</p>
              </div>
            </div>
            {!cat.isDefault && (
              <button onClick={() => handleDelete(cat.id)} className="rounded text-sm font-semibold text-danger-500 transition-colors hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500">Excluir</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
