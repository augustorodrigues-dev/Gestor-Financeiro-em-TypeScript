import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreditCardManager from './CreditCardManager';
import { creditCardService } from '../services/creditCardService';

vi.mock('../services/creditCardService', () => ({
  creditCardService: {
    getCards: vi.fn(),
    createCard: vi.fn(),
    deleteCard: vi.fn(),
  },
}));

const svc = creditCardService as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('<CreditCardManager />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getCards.mockResolvedValue([
      { id: 1, name: 'Inter', limitAmount: 1000, closingDay: 20, dueDay: 28, used: 850, usagePercent: 85, critical: true },
    ]);
  });

  it('lista cartão e mostra alerta de limite crítico (UC20)', async () => {
    render(<CreditCardManager />);
    expect(await screen.findByText(/Inter/)).toBeInTheDocument();
    expect(screen.getByText(/Limite crítico: 85%/)).toBeInTheDocument();
  });

  it('cria um cartão', async () => {
    svc.createCard.mockResolvedValue({ id: 2 });
    render(<CreditCardManager />);
    await screen.findByText(/Inter/);
    fireEvent.change(screen.getByLabelText('Nome do Cartão'), { target: { value: 'Nubank' } });
    fireEvent.change(screen.getByLabelText('Limite (R$)'), { target: { value: '3000' } });
    fireEvent.change(screen.getByLabelText('Fechamento'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Vencimento'), { target: { value: '17' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Cartão' }));
    await waitFor(() => expect(svc.createCard).toHaveBeenCalled());
    expect(svc.createCard.mock.calls[0][0]).toMatchObject({ name: 'Nubank', limitAmount: 3000 });
  });

  it('exclui um cartão', async () => {
    svc.deleteCard.mockResolvedValue({});
    render(<CreditCardManager />);
    await screen.findByText(/Inter/);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(svc.deleteCard).toHaveBeenCalledWith(1));
  });
});
