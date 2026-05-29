const API_URL = 'http://localhost:3001/api/goals';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const goalService = {
  getGoals: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar metas.');
    return res.json();
  },

  createGoal: async (data: { name: string; targetAmount: number; currentAmount?: number; deadline: string }) => {
    const res = await fetch(API_URL, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao criar meta.');
    return res.json();
  },

  updateGoal: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao atualizar meta.');
    return res.json();
  },

  deleteGoal: async (id: number) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao excluir meta.');
    return res.json();
  },
};
