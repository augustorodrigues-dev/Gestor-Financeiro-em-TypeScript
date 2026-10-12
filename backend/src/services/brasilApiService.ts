import axios from 'axios';
import { selecionarBancosValidos } from '../utils/bancosValidos';

export const getBanks = async () => {
  try {
    const response = await axios.get('https://brasilapi.com.br/api/banks/v1');

    return selecionarBancosValidos(response.data);
  } catch (error) {
    console.error("Erro ao buscar bancos na Brasil API:", error);
    throw new Error("Serviço de instituições financeiras indisponível no momento.");
  }
};
