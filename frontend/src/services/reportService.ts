const API_URL = 'http://localhost:3001/api/reports';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getMonthlyReport = async (month: number, year: number) => {
  const response = await fetch(`${API_URL}?month=${month}&year=${year}`, {
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar relatório financeiro.');
  }
  return response.json();
};