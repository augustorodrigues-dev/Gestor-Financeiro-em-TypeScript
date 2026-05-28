import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middlewares/authMiddleware';

jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Unitário: authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 quando não há header de autorização', () => {
    const res = makeRes();
    const next = jest.fn();
    authMiddleware({ headers: {} } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token é inválido', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    const res = makeRes();
    const next = jest.fn();
    authMiddleware({ headers: { authorization: 'Bearer token_ruim' } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('injeta req.user e chama next quando o token é válido', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 42, role: 'USER' });
    const req: any = { headers: { authorization: 'Bearer token_bom' } };
    const res = makeRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(req.user).toEqual({ id: 42, role: 'USER' });
    expect(next).toHaveBeenCalled();
  });
});
