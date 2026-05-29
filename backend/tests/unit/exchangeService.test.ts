import axios from 'axios';
import { getExchangeRate, convertCurrency } from '../../src/services/exchangeService';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Unitário: exchangeService (UC10)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna a cotação do par solicitado', async () => {
    axiosMock.get.mockResolvedValue({ data: { USDBRL: { bid: '5.00', name: 'Dólar/Real' } } });
    const rate = await getExchangeRate('USD', 'BRL');
    expect(rate.bid).toBe(5);
    expect(rate.fromCache).toBe(false);
  });

  it('converte um valor pela cotação', async () => {
    axiosMock.get.mockResolvedValue({ data: { USDBRL: { bid: '5.00', name: 'Dólar/Real' } } });
    const result = await convertCurrency('USD', 'BRL', 10);
    expect(result.converted).toBe(50);
  });

  it('usa cache quando o serviço externo falha (fluxo alternativo UC10)', async () => {
    // 1ª chamada popula o cache
    axiosMock.get.mockResolvedValueOnce({ data: { EURBRL: { bid: '6.00', name: 'Euro/Real' } } });
    await getExchangeRate('EUR', 'BRL');
    // 2ª falha → deve cair no cache
    axiosMock.get.mockRejectedValueOnce(new Error('offline'));
    const rate = await getExchangeRate('EUR', 'BRL');
    expect(rate.fromCache).toBe(true);
    expect(rate.bid).toBe(6);
  });

  it('lança erro quando falha e não há cache', async () => {
    axiosMock.get.mockRejectedValue(new Error('offline'));
    await expect(getExchangeRate('GBP', 'JPY')).rejects.toThrow('indisponível');
  });
});
