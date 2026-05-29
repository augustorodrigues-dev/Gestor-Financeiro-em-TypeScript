const API_URL = 'http://localhost:3001/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// UC07 — Relatório financeiro consolidado
export const getReportSummary = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const res = await fetch(`${API_URL}/reports/summary?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erro ao gerar relatório.');
  return res.json();
};

// UC19 — Alertas de contas próximas ao vencimento
export const getUpcomingAlerts = async (days = 7) => {
  const res = await fetch(`${API_URL}/alerts/upcoming?days=${days}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erro ao buscar alertas.');
  return res.json();
};

// UC10 — Cotação de moeda (câmbio) — endpoint público
export const getExchange = async (from: string, to: string, amount: number) => {
  const res = await fetch(`${API_URL}/exchange?from=${from}&to=${to}&amount=${amount}`);
  if (!res.ok) throw new Error('Serviço de cotação indisponível.');
  return res.json();
};
