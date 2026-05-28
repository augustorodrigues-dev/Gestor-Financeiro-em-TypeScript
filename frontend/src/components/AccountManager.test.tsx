import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountManager from './AccountManager';
import { accountService } from '../services/accountService';

vi.mock('../services/accountService', () => ({
  accountService: {
    getUserAccounts: vi.fn(),
    getBanks: vi.fn(),
    createAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

const accSvc = accountService as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('<AccountManager />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accSvc.getUserAccounts.mockResolvedValue([
      { id: 1, name: 'Banco Inter', type: 'CORRENTE', balance: 250, _count: { transactions: 2 } },
    ]);
    accSvc.getBanks.mockResolvedValue([{ ispb: '1', code: 77, name: 'Banco Teste' }]);
  });

  it('lista as contas do usuário', async () => {
    render(<AccountManager />);
    expect(await screen.findByText('Banco Inter')).toBeInTheDocument();
    expect(screen.getByText(/250\.00|250,00/)).toBeInTheDocument();
  });

  it('cria uma nova conta', async () => {
    accSvc.createAccount.mockResolvedValue({ id: 2 });
    render(<AccountManager />);
    await screen.findByText('Banco Inter');

    fireEvent.change(screen.getByLabelText('Nome da Instituição'), { target: { value: 'Banco Teste' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(accSvc.createAccount).toHaveBeenCalled());
    expect(accSvc.createAccount.mock.calls[0][0]).toMatchObject({ name: 'Banco Teste' });
  });

  it('exclui uma conta ao confirmar', async () => {
    accSvc.deleteAccount.mockResolvedValue({});
    render(<AccountManager />);
    await screen.findByText('Banco Inter');

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(accSvc.deleteAccount).toHaveBeenCalledWith(1));
  });
});
