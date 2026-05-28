import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from './AdminPanel';

const users = [
  { id: 1, name: 'Jadão o Liso', email: 'jadao@gmail.com', role: 'USER' },
  { id: 3, name: 'Alexandra Bargan', email: 'alexandra@gmail.com', role: 'ADMIN' },
];

const makeFetchMock = () =>
  vi.fn((_url: string, opts?: any) => {
    const method = opts?.method || 'GET';
    if (method === 'GET') return Promise.resolve({ ok: true, json: async () => users });
    return Promise.resolve({ ok: true, json: async () => ({ message: 'ok' }) });
  });

describe('<AdminPanel />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega e lista os usuários com seus níveis de acesso', async () => {
    global.fetch = makeFetchMock() as any;
    render(<AdminPanel />);
    expect(await screen.findByText('Jadão o Liso')).toBeInTheDocument();
    expect(screen.getByText('Alexandra Bargan')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
  });

  it('cria um novo administrador via formulário', async () => {
    const fetchMock = makeFetchMock();
    global.fetch = fetchMock as any;
    render(<AdminPanel />);
    await screen.findByText('Jadão o Liso');

    fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'Novo Admin' } });
    fireEvent.change(screen.getByLabelText('E-mail de Acesso'), { target: { value: 'novo@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha Inicial'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Administrador/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((c) => c[1]?.method === 'POST');
      expect(postCall).toBeTruthy();
      expect(JSON.parse(postCall![1].body).role).toBe('ADMIN');
    });
  });

  it('abre o modo de edição e salva a atualização', async () => {
    const fetchMock = makeFetchMock();
    global.fetch = fetchMock as any;
    render(<AdminPanel />);
    await screen.findByText('Jadão o Liso');

    fireEvent.click(screen.getByRole('button', { name: /Editar Jadão o Liso/i }));
    fireEvent.change(screen.getByLabelText('Nome do usuário'), { target: { value: 'Jadão Editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find((c) => c[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });
  });
});
