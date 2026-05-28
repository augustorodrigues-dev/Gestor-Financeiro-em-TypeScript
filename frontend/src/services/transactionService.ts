const API_URL = 'http://localhost:3001/api/transactions';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getTransactions = async () => {
  const response = await fetch(API_URL, {
    headers: getHeaders()
  });
  
  if (!response.ok) throw new Error('Erro ao buscar transações.');
  return response.json();
};

export const createTransaction = async (data: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar transação.');
  }
  return response.json();
};

export const updateTransaction = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar transação.');
  }
  return response.json();
};

export const deleteTransaction = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir transação.');
  }
  return response.json();
};