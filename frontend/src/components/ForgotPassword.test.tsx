import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './ForgotPassword';
import { forgotPassword, resetPassword } from '../services/userService';

vi.mock('../services/userService', () => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

const forgotMock = forgotPassword as unknown as ReturnType<typeof vi.fn>;
const resetMock = resetPassword as unknown as ReturnType<typeof vi.fn>;

describe('<ForgotPassword />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('solicita recuperação e avança para a etapa de redefinição', async () => {
    forgotMock.mockResolvedValue({ message: 'enviado', resetToken: 'tok-123' });
    render(<ForgotPassword onBack={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('E-mail de recuperação'), { target: { value: 'a@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar link/ }));

    expect(await screen.findByLabelText('Token')).toHaveValue('tok-123');
  });

  it('redefine a senha com o token', async () => {
    forgotMock.mockResolvedValue({ message: 'enviado', resetToken: 'tok-123' });
    resetMock.mockResolvedValue({ message: 'ok' });
    render(<ForgotPassword onBack={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('E-mail de recuperação'), { target: { value: 'a@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar link/ }));
    await screen.findByLabelText('Token');

    fireEvent.change(screen.getByLabelText('Nova Senha'), { target: { value: 'novaSenha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Redefinir Senha' }));

    await waitFor(() => expect(resetMock).toHaveBeenCalledWith('tok-123', 'novaSenha'));
  });

  it('volta para o login', () => {
    const onBack = vi.fn();
    render(<ForgotPassword onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /Voltar para o login/ }));
    expect(onBack).toHaveBeenCalled();
  });
});
