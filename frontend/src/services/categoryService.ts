const API_URL = 'http://localhost:3001/api/categories';
const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` });

export const categoryService = {
  getCategories: () => fetch(API_URL, { headers: getHeaders() }).then(res => res.json()),
  
  createCategory: (data: any) => fetch(API_URL, { 
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data) 
  }).then(res => res.json()),

  // 🚀 NOVA FUNÇÃO ADICIONADA:
  updateCategory: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, { 
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) 
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erro ao atualizar categoria.');
    }
    return res.json();
  },

  deleteCategory: (id: number) => fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() })
};