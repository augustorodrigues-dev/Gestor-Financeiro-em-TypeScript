import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { updateProfile } from '../services/userService';

vi.mock('../services/userService', () => ({ updateProfile: vi.fn() }));
const updateMock = updateProfile as unknown as ReturnType<typeof vi.fn>;

describe('<Profile />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('atualiza o perfil e propaga o novo nome', async () => {
    const onUpdated = vi.fn();
    updateMock.mockResolvedValue({ user: { name: 'Novo Nome' } });
    render(<Profile userName="Ana" onUpdated={onUpdated} />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novo Nome' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(onUpdated).toHaveBeenCalledWith('Novo Nome');
    expect(await screen.findByRole('status')).toHaveTextContent('atualizado com sucesso');
  });

  it('mostra erro ao falhar', async () => {
    updateMock.mockRejectedValue(new Error('E-mail em uso'));
    render(<Profile userName="Ana" onUpdated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Novo E-mail/), { target: { value: 'x@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail em uso');
  });
});
