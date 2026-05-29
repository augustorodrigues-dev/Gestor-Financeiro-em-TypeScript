import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reports from './Reports';
import { getReportSummary, getExchange } from '../services/financeService';

vi.mock('../services/financeService', () => ({
  getReportSummary: vi.fn(),
  getExchange: vi.fn(),
}));

const summaryMock = getReportSummary as unknown as ReturnType<typeof vi.fn>;
const exchangeMock = getExchange as unknown as ReturnType<typeof vi.fn>;

describe('<Reports />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    summaryMock.mockResolvedValue({
      totalIncome: 3500, totalExpense: 1500, balance: 2000, count: 2,
      transactions: [{ description: 'Salário', type: 'INCOME', amount: 3500, date: '2026-05-20' }],
    });
  });

  it('exibe o resumo financeiro (UC07)', async () => {
    render(<Reports />);
    expect(await screen.findByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Movimentações (2)')).toBeInTheDocument();
  });

  it('converte moeda via câmbio (UC10)', async () => {
    exchangeMock.mockResolvedValue({ converted: 50.52, bid: 5.05, fromCache: false });
    render(<Reports />);
    await screen.findByText('Receitas');
    fireEvent.click(screen.getByRole('button', { name: 'Converter' }));
    await waitFor(() => expect(exchangeMock).toHaveBeenCalled());
    expect(await screen.findByText(/50.52 BRL/)).toBeInTheDocument();
  });

  it('permite exportar CSV (UC16)', async () => {
    // jsdom não implementa URL.createObjectURL — stub para não quebrar
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() });
    render(<Reports />);
    await screen.findByText('Receitas');
    const btn = screen.getByRole('button', { name: /Exportar CSV/ });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });
});
