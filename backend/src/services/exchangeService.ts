import axios from 'axios';

export const getExchangeRates = async () => {
  try {
    const response = await axios.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar cotações:", error);
    throw new Error("Serviço de câmbio indisponível no momento.");
  }
};