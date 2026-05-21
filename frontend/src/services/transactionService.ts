const API_URL = 'http://localhost:3001/api';

export const getTransactions = async (userId: number) => {
  const response = await fetch(`${API_URL}/transactions/user/${userId}`);
  return response.json();
};

export const createTransaction = async (data: any) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar transação');
  return response.json();
};

export const deleteTransaction = async (id: number) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Erro ao deletar transação');
  return response.json();
};

export const updateTransaction = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar transação');
  return response.json();
};