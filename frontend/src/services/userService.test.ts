import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUser } from './userService';

describe('userService', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('registerUser retorna os dados quando o cadastro é bem-sucedido', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt', user: { id: 1, name: 'Ana', role: 'USER' } }),
    });
    global.fetch = fetchMock as any;

    const data = await registerUser({ name: 'Ana', email: 'ana@x.com', password: '1234' });

    expect(data.user.id).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/users/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('registerUser lança o erro retornado pelo servidor', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'E-mail já cadastrado' }),
    }) as any;

    await expect(registerUser({ name: 'X', email: 'x@x.com', password: '1' })).rejects.toThrow(
      'E-mail já cadastrado'
    );
  });
});
