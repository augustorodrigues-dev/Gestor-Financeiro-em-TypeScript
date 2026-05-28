import axios from 'axios';
import { getBanks } from '../../src/services/brasilApiService';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Unitário: brasilApiService (integração externa)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna no máximo 20 bancos válidos (com code e name)', async () => {
    const fakeBanks = Array.from({ length: 30 }, (_, i) => ({ code: i + 1, name: `Banco ${i + 1}`, ispb: `${i}` }));
    fakeBanks.push({ code: 0 as any, name: '' as any, ispb: 'invalido' });
    axiosMock.get.mockResolvedValue({ data: fakeBanks });

    const banks = await getBanks();

    expect(axiosMock.get).toHaveBeenCalledWith('https://brasilapi.com.br/api/banks/v1');
    expect(banks.length).toBeLessThanOrEqual(20);
    expect(banks.every((b: any) => b.code && b.name)).toBe(true);
  });

  it('lança erro amigável quando a API externa falha', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axiosMock.get.mockRejectedValue(new Error('network'));
    await expect(getBanks()).rejects.toThrow('Serviço de instituições financeiras indisponível no momento.');
  });
});
