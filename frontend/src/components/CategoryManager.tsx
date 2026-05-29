import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

export function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => {
    categoryService.getCategories().then(setCategories);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory({ name, type, color, icon: 'tag' });
      setName('');
      loadCategories();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) return alert('Categorias padrão não podem ser removidas.');
    if (window.confirm('Tem certeza?')) {
      await categoryService.deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🏷️ Gerenciar Categorias</h2>

      {}
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input className="border p-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Cor</label>
          <input type="color" className="p-1 h-10 w-16" value={color} onChange={e => setColor(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Criar</button>
      </form>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="p-4 rounded-lg shadow-sm border flex justify-between items-center" style={{ borderLeft: `8px solid ${cat.color || '#ccc'}` }}>
            <div>
              <p className="font-bold">{cat.name}</p>
              <span className="text-xs uppercase bg-gray-100 px-2 rounded">{cat.type}</span>
            </div>
            {!cat.isDefault && (
              <button onClick={() => handleDelete(cat.id, cat.isDefault)} className="text-red-500 hover:text-red-700">🗑️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}