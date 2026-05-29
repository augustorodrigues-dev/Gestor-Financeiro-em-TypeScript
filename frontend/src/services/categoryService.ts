const API_URL = 'http://localhost:3001/api/categories';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const categoryService = {
  getCategories: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar categorias.');
    return res.json();
  },

  createCategory: async (data: { name: string; type: string; icon?: string; color?: string }) => {
    const res = await fetch(API_URL, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao criar categoria.');
    return res.json();
  },

  updateCategory: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao atualizar categoria.');
    return res.json();
  },

  deleteCategory: async (id: number) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao excluir categoria.');
    return res.json();
  },
};
