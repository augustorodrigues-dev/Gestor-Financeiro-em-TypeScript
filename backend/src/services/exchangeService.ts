import axios from 'axios';

// Cache simples em memória para o fluxo alternativo do UC10
// (usa o último valor conhecido caso o serviço externo esteja indisponível).
const cache: Record<string, { bid: number; name: string; at: number }> = {};

/**
 * Consulta a cotação de um par de moedas (ex.: USD-BRL) na AwesomeAPI.
 * UC10 — Consultar Cotação de Moeda.
 */
export const getExchangeRate = async (from: string, to: string) => {
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  try {
    const response = await axios.get(`https://economia.awesomeapi.com.br/last/${pair}`);
    const key = `${from.toUpperCase()}${to.toUpperCase()}`;
    const data = response.data[key];
    if (!data) throw new Error('Par de moedas inválido.');

    const result = { bid: Number(data.bid), name: data.name, at: Date.now() };
    cache[pair] = result;
    return { pair, ...result, fromCache: false };
  } catch (error) {
    // Fluxo alternativo: serviço externo indisponível → usa cache se houver
    if (cache[pair]) {
      return { pair, ...cache[pair], fromCache: true };
    }
    throw new Error('Serviço de cotação indisponível e sem dados em cache.');
  }
};

/** Converte um valor de uma moeda para outra. */
export const convertCurrency = async (from: string, to: string, amount: number) => {
  const rate = await getExchangeRate(from, to);
  return { ...rate, amount, converted: Number((amount * rate.bid).toFixed(2)) };
};
