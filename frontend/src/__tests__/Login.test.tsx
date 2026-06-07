import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';

describe('<Login /> (componente isolado)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renderiza os campos de e-mail e senha e o botão Entrar', () => {
    render(<Login onLoginSuccess={() => {}} onNavigateToRegister={() => {}} />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando a autenticação falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'E-mail ou senha inválidos.' }),
    }));

    render(<Login onLoginSuccess={() => {}} onNavigateToRegister={() => {}} />);

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'errado@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'senha-errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText(/inválidos/i)).toBeInTheDocument();
  });

  it('chama onLoginSuccess com os dados do usuário ao autenticar com sucesso', async () => {
    const onLoginSuccess = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt-token', user: { id: 7, name: 'Cauê', role: 'USER' } }),
    }));

    render(<Login onLoginSuccess={onLoginSuccess} onNavigateToRegister={() => {}} />);

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'caue@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(7, 'Cauê', 'USER'));
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('aciona a navegação para o cadastro', async () => {
    const onNavigateToRegister = vi.fn();
    render(<Login onLoginSuccess={() => {}} onNavigateToRegister={onNavigateToRegister} />);

    await userEvent.click(screen.getByRole('button', { name: /cadastre-se aqui/i }));

    expect(onNavigateToRegister).toHaveBeenCalledTimes(1);
  });

  it('permite login rápido pelos botões de acesso (ex.: Jadão)', async () => {
    const onLoginSuccess = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 't', user: { id: 1, name: 'Jadão o Liso', role: 'USER' } }),
    }));

    render(<Login onLoginSuccess={onLoginSuccess} onNavigateToRegister={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: /Jadão o Liso/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(1, 'Jadão o Liso', 'USER'));
  });
});
