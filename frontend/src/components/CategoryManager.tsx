import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

export function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [color, setColor] = useState('#3b82f6');
  
  // 🚀 NOVO ESTADO: Controla qual categoria está sendo editada no momento
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => {
    categoryService.getCategories().then(setCategories);
  };

  // 🚀 AJUSTADO: Agora ele cria OU edita, dependendo do estado 'editingId'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, { name, type, color, icon: 'tag' });
      } else {
        await categoryService.createCategory({ name, type, color, icon: 'tag' });
      }
      resetForm();
      loadCategories();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 🚀 NOVA FUNÇÃO: Joga os dados do card lá para cima no formulário
  const handleEditClick = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#3b82f6');
  };

  // 🚀 NOVA FUNÇÃO: Limpa o formulário e sai do modo de edição
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('EXPENSE');
    setColor('#3b82f6');
  };

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) return alert('Categorias padrão não podem ser removidas.');
    if (window.confirm('Tem certeza que deseja apagar esta categoria?')) {
      await categoryService.deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🏷️ Gerenciar Categorias</h2>

      {/* Formulário Duplo: Serve tanto para Criar quanto para Editar */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input data-cy="cat-name" className="border p-2 rounded focus:outline-blue-500" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select className="border p-2 rounded focus:outline-blue-500" value={type} onChange={e => setType(e.target.value)}>
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cor</label>
          <input type="color" className="p-1 h-10 w-16 cursor-pointer" value={color} onChange={e => setColor(e.target.value)} />
        </div>
        
        <div className="flex gap-2">
          <button data-cy="cat-submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors">
            {editingId ? 'Salvar Edição' : 'Criar'}
          </button>
          
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-bold transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="p-4 rounded-lg shadow-sm border bg-white flex justify-between items-center" style={{ borderLeft: `8px solid ${cat.color || '#ccc'}` }}>
            <div>
              <p className="font-bold text-gray-800">{cat.name}</p>
              <span className="text-xs font-semibold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {cat.type === 'EXPENSE' ? 'Despesa' : 'Receita'}
              </span>
            </div>
            
            {/* Oculta os botões de ação se for uma categoria padrão do sistema */}
            {!cat.isDefault && (
              <div className="flex gap-3">
                <button type="button" onClick={() => handleEditClick(cat)} className="text-blue-500 hover:text-blue-700 text-lg transition-colors" title="Editar">
                  ✏️
                </button>
                <button type="button" onClick={() => handleDelete(cat.id, cat.isDefault)} className="text-red-500 hover:text-red-700 text-lg transition-colors" title="Apagar">
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}