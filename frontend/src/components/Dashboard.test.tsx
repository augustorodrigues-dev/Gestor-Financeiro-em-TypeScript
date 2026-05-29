import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { accountService } from '../services/accountService';
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from '../services/transactionService';
import { getUpcomingAlerts } from '../services/financeService';

vi.mock('../services/accountService', () => ({
  accountService: {
    getUserAccounts: vi.fn(),
    getBanks: vi.fn(),
    createAccount: vi.fn(),
  },
}));

vi.mock('../services/transactionService', () => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  updateTransaction: vi.fn(),
}));

vi.mock('../services/financeService', () => ({
  getUpcomingAlerts: vi.fn(),
}));

const accSvc = accountService as unknown as Record<string, ReturnType<typeof vi.fn>>;
const getTx = getTransactions as unknown as ReturnType<typeof vi.fn>;
const createTx = createTransaction as unknown as ReturnType<typeof vi.fn>;
const deleteTx = deleteTransaction as unknown as ReturnType<typeof vi.fn>;
const updateTx = updateTransaction as unknown as ReturnType<typeof vi.fn>;
const alertsMock = getUpcomingAlerts as unknown as ReturnType<typeof vi.fn>;

const accounts = [{ id: 1, name: 'Banco Inter', type: 'CORRENTE', balance: 100 }];
const transactions = [
  { id: 1, description: 'Salário', amount: 100, type: 'INCOME', accountId: 1, date: '2026-05-20' },
  { id: 2, description: 'Mercado', amount: 50, type: 'EXPENSE', accountId: 1, date: '2026-05-21' },
];

describe('<Dashboard />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accSvc.getUserAccounts.mockResolvedValue(accounts);
    accSvc.getBanks.mockResolvedValue([]);
    getTx.mockResolvedValue(transactions);
    alertsMock.mockResolvedValue([]);
  });

  it('carrega e exibe o saldo consolidado e o extrato', async () => {
    render(<Dashboard userId={1} userNameSession="Ana" />);
    expect(await screen.findByText('Salário')).toBeInTheDocument();
    expect(screen.getByText(/100,00/)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo de volta/)).toBeInTheDocument();
  });

  it('cria uma nova transação ao enviar o formulário', async () => {
    createTx.mockResolvedValue({ id: 2 });
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');

    fireEvent.change(screen.getByLabelText('Descrição da transação'), { target: { value: 'Mercado' } });
    fireEvent.change(screen.getByLabelText('Valor da transação'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

    await waitFor(() => expect(createTx).toHaveBeenCalled());
    const payload = createTx.mock.calls[0][0];
    expect(payload.description).toBe('Mercado');
    expect(payload.amount).toBe(50);
  });

  it('exclui uma transação ao confirmar', async () => {
    deleteTx.mockResolvedValue({});
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');

    fireEvent.click(screen.getByRole('button', { name: /Excluir transação Salário/i }));
    await waitFor(() => expect(deleteTx).toHaveBeenCalledWith(1));
  });

  it('entra no modo de edição e atualiza a transação', async () => {
    updateTx.mockResolvedValue({ id: 1 });
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');

    fireEvent.click(screen.getByRole('button', { name: /Editar transação Salário/i }));
    // O formulário muda para o modo edição (botão "Atualizar")
    const atualizar = await screen.findByRole('button', { name: 'Atualizar' });
    fireEvent.change(screen.getByLabelText('Valor da transação'), { target: { value: '999' } });
    fireEvent.click(atualizar);

    await waitFor(() => expect(updateTx).toHaveBeenCalledWith(1, expect.objectContaining({ amount: 999 })));
  });

  it('cancela a edição e volta ao modo de criação', async () => {
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');

    fireEvent.click(screen.getByRole('button', { name: /Editar transação Salário/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('button', { name: 'Salvar Transação' })).toBeInTheDocument();
  });

  it('filtra o extrato pela busca de descrição (UC13)', async () => {
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');
    expect(screen.getByText('Mercado')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar transações'), { target: { value: 'Salário' } });
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.queryByText('Mercado')).not.toBeInTheDocument();
  });

  it('exibe banner de alerta de vencimento quando há pendências (UC19)', async () => {
    alertsMock.mockResolvedValue([{ id: 9, description: 'Conta de luz', dueDate: '2026-06-01', overdue: false }]);
    render(<Dashboard userId={1} userNameSession="Ana" />);
    expect(await screen.findByText(/próxima\(s\) do vencimento/)).toBeInTheDocument();
  });

  it('vincula uma nova conta financeira', async () => {
    accSvc.getBanks.mockResolvedValue([{ ispb: '1', code: 77, name: 'Banco Teste' }]);
    accSvc.createAccount.mockResolvedValue({ id: 2 });
    render(<Dashboard userId={1} userNameSession="Ana" />);
    await screen.findByText('Salário');

    fireEvent.change(screen.getByLabelText('Instituição (Brasil API)'), { target: { value: 'Banco Teste' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Conta Oficial/i }));

    await waitFor(() => expect(accSvc.createAccount).toHaveBeenCalled());
    expect(accSvc.createAccount.mock.calls[0][0]).toMatchObject({ name: 'Banco Teste' });
  });
});
