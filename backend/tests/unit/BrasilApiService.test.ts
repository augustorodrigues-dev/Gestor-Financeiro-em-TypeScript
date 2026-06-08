import axios from 'axios';
import { getBanks } from '../../src/services/brasilApiService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testes Unitários: brasilApiService (API Externa)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('1. Deve filtrar instituições inválidas (sem código ou nome) e limitar a 20 resultados', async () => {
    const payload = Array.from({ length: 30 }, (_, i) => ({ code: i + 1, name: `Banco ${i + 1}` }));
    // Itens inválidos que devem ser removidos pelo filtro:
    payload.push({ code: 999, name: '' } as any);
    payload.push({ code: null, name: 'Sem código' } as any);

    mockedAxios.get.mockResolvedValue({ data: payload });

    const result = await getBanks();

    expect(mockedAxios.get).toHaveBeenCalledWith('https://brasilapi.com.br/api/banks/v1');
    expect(result).toHaveLength(20); // slice(0, 20)
    expect(result.every((b: any) => b.code && b.name)).toBe(true);
  });

  it('2. Deve lançar erro amigável quando a API externa estiver indisponível', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(getBanks()).rejects.toThrow('Serviço de instituições financeiras indisponível no momento.');
  });
});
